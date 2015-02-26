Drinks = new Mongo.Collection('drinks');
Ingredients = new Mongo.Collection('ingredients');
drinkSchema = new SimpleSchema({
  drinkName: {
    type: String,
    label: "Name",
    max: 200
  },
  drinkDescription: {
    type: String,
    label: "Description"
  },
  drinkInstructions: {
    type: String,
    label: "Instructions"
  },
  ingredients: {
    type: [Ingredients],
    label: "Ingredients",
    autoform: {
      type: "select2",
      afFieldInput: {
        multiple: true
      }
    }
  },
  submitted: {
    type: Date,
    label: "Added on"
  }
});

Drinks.attachSchema(drinkSchema);

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
  drinkInsert: function(drinkAttributes, ingredients) {
    check(Meteor.userId(), String);
    check(ingredients, Array);
    check(drinkAttributes, {
      drinkName: String,
      drinkDescription: String,
      drinkInstructions: String
    });

    var errors = validateDrink(drinkAttributes, ingredients);

    if (errors.drinkName || errors.drinkIngredients)
      throw new Meteor.Error('invalid-drink', "You must enter a drink name and ingredients.");

    var drinkWithSameName = Drinks.findOne({drinkName: drinkAttributes.drinkName});
    if (drinkWithSameName) {
      return {
        drinkExists: true,
        _id: drinkWithSameName._id
      };
    }

    var user = this.userId;

    ingredientsIds = _(ingredients).map(function(ingredient) {
      ingredientId = Meteor.call('ingredientInsert', ingredient);
      return {id: ingredientId};
    });

    var drink = _.extend(drinkAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      commentsCount: 0,
      ingredients: ingredientsIds,
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

validateDrink = function (drink, ingredients) {
  var errors = {};

  if (!drink.drinkName)
    errors.drinkName = "Please name your drink.";

  if (!ingredients)
    errors.drinkIngredients = "Please add some ingredients.";

  if (!drink.drinkDescription)
    errors.drinkDescription = "Please write a brief description of your drink.";

  if (!drink.drinkInstructions)
    errors.drinkInstructions = "Please include step-by-step instructions for mixing this drink.";

  return errors;
};
