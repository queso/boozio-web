Meteor.publish('drinks', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });
  return Drinks.find({}, options);
});

Meteor.publish('singleDrink', function(id) {
  check(id, String);
  var ingredients = null;
  drinks = Drinks.find(id);
  drink = drinks.fetch()[0];
  if (drink) {
    ingredientIds = _(drink.ingredients).map(function(ingredient) {
      return ingredient.id;
    });
    ingredients = Ingredients.find({_id: {$in: ingredientIds}});
  }
  return [drinks, ingredients];
});

Meteor.publish('ingredients', function(ingredientId) {
  return Ingredients.find();
});

Meteor.publish('comments', function(drinkId) {
  check(drinkId, String);
  return Comments.find();
});

Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId, read: false});
});
