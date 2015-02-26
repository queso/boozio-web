ingredientSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Ingredient Name",
    max: 200
  },
  submitted: {
    type: Date,
    label: "Added on"
  }
});

Ingredients.attachSchema(ingredientSchema);

Meteor.methods({
  ingredientInsert: function(name) {
    check(this.userId, String);
    check(name, String);

    var ingredientWithSameName = Ingredients.findOne({name: name});
    if (ingredientWithSameName) {
      return ingredientWithSameName._id;
    }

    var user = Meteor.user();

    //create the ingredient, save the id
    ingredient = Ingredients.insert({name: name, submitted: new Date()});

    return ingredient;
  }
});
