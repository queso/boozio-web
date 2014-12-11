Drinks = new Mongo.Collection('drinks');

Drinks.allow({
  update: function(userId, drink) { return ownsDocument(userId, drink); },
  remove: function(userId, drink) { return ownsDocument(userId, drink); }
});

Drinks.deny({
  update: function(userId, drink, fieldNames) {
    //only allow editing these fields:
    return (_.without(fieldNames, 'drinkName', 'drinkIngredients').length > 0);
  }
});

Meteor.methods({
  drinkInsert: function(drinkAttributes) {
    check(Meteor.userId(), String);
    check(drinkAttributes, {
      drinkName: String,
      drinkIngredients: Array,
      drinkDescription: String,
      drinkInstructions: String
    });

    var errors = validateDrink(drinkAttributes);

    if (errors.drinkName || errors.drinkIngredients)
      throw new Meteor.Error('invalid-drink', "You must enter a drink name and ingredients.");

    var drinkWithSameName = Drinks.findOne({drinkName: drinkAttributes.drinkName});
    if (drinkWithSameName) {
      return {
        drinkExists: true,
        _id: drinkWithSameName._id
      }
    }

    var user = Meteor.user();

    var drink = _.extend(drinkAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [],
      votes: 0
    });

    var drinkId = Drinks.insert(drink);

    return {
      _id: drinkId
    };
  },

  upvote: function(drinkId) {
    check(this.userId, String);
    check(drinkId, String);

    var affected = Drinks.update({
      _id: drinkId,
      upvoters: {$ne: this.userId}
    }, {
      $addToSet: {upvoters: this.userId},
      $inc: {votes: 1}
    });
    if (! affected)
      throw new Meteor.Error('invalid', "Vote not counted.");
  }
});

validateDrink = function (drink) {
  var errors = {};

  if (!drink.drinkName)
    errors.drinkName = "Please name your drink.";

  if (!drink.drinkIngredients)
    errors.drinkIngredients = "Please add some ingredients.";

  if (!drink.drinkDescription)
    errors.drinkDescription = "Please write a brief description of your drink.";

  if (!drink.drinkInstructions)
    errors.drinkInstructions = "Please include step-by-step instructions for mixing this drink.";

  return errors;
}
