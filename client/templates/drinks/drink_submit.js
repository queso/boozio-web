Template.drinkSubmit.created = function() {
  Session.set('drinkSubmitErrors', {});
};

Template.drinkSubmit.helpers({
  errorMessage: function(field) {
    return Session.get('drinkSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('drinkSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.drinkSubmit.events({
  'submit form': function(e) {
    e.preventDefault();

    var drink = {
      drinkName: $(e.target).find('[name=drinkName]').val(),
      drinkDescription: $(e.target).find('[name=drinkDescription]').val(),
      drinkInstructions: $(e.target).find('[name=drinkInstructions]').val()
    };

    var ingredients = $(e.target).find('[name=drinkIngredients]').val().split(",");
    var errors = validateDrink(drink, ingredients);

    if (errors.drinkName || errors.drinkIngredients || errors.drinkDescription || errors.drinkInstructions)
      return Session.set('drinkSubmitErrors', errors);

    Meteor.call('drinkInsert', drink, ingredients, function(error, result) {
      // display the error to the user and abort
      debugger
      if (error)
        return throwError(error.reason);

      // show this result but route anyway
      if (result.drinkExists) {
        throwError('A drink with this name has already been posted');
      } else {
        Router.go('drinkPage', {_id: result._id});
      }
    });
  }
});
