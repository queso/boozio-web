Ingredients = new Mongo.Collection('ingredients');

Meteor.methods({
  ingredientInsert: function(ingredientAttributes) {
    check(this.userId, String);
    check(ingredientAttributes, {
      ingredientName: String
    });

    var user = Meteor.user();

    ingredient = _.extend(ingredientAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    //create the ingredient, save the id
    ingredient._id = Ingredients.insert(ingredient);

    return ingredient._id;
  }
});
