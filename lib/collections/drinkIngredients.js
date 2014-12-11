DrinkIngredients = new Mongo.Collection('drinkIngredients');

Meteor.methods({
  drinkIngredientInsert: function(drinkIngredientAttributes) {
    check(this.userId, String);
    check(drinkIngredientAttributes, {
      drinkIngredientQty: Number,
      drinkIngredientMeasure: String
    });

    drinkIngredient = _.extend(drinkIngredientAttributes, {
      drinkId: this.drink._id,
      ingredientId: this.ingredient._id
    });

    //create the drinkIngredient relationship, save the id
    drinkIngredient._id = DrinkIngredients.insert(drinkIngredient);
  }
});
