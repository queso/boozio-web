Template.drinkItem.helpers({
  ingredients: function() {
    return Ingredients.find();
  },
  ownDrink: function() {
    return this.userId == Meteor.userId();
  },
  upvotedClass: function() {
    var userId = Meteor.userId();
    if (userId && !_.include(this.upvoters, userId)) {
      return 'btn-success upvotable';
    } else {
      return 'disabled';
    }
  }
});

Template.drinkItem.events({
  'click .upvotable': function(e) {
    e.preventDefault();
    Meteor.call('upvote', this._id);
  }
});
