Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('notifications')]
  }
});

DrinksListController = RouteController.extend({
  template: 'drinksList',
  increment: 10,
  drinksLimit: function() {
    return parseInt(this.params.drinksLimit) || this.increment;
  },
  findOptions: function() {
    return {sort: this.sort, limit: this.drinksLimit()};
  },
  subscriptions: function() {
    this.drinksSub = Meteor.subscribe('drinks', this.findOptions());
  },
  drinks: function() {
    return Drinks.find({}, this.findOptions());
  },
  data: function() {
    var hasMore = this.drinks().count() === this.drinksLimit();
    return {
      drinks: this.drinks(),
      ready: this.drinksSub.ready,
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});

NewDrinksController = DrinksListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.newDrinks.path({drinksLimit: this.drinksLimit() + this.increment})
  }
});

BestDrinksController = DrinksListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.bestDrinks.path({drinksLimit: this.drinksLimit() + this.increment})
  }
});

Router.route('/', {
  name: 'home',
  controller: NewDrinksController
});

Router.route('/new/:drinksLimit?', {name: 'newDrinks'});

Router.route('/best/:drinksLimit?', {name: 'bestDrinks'});


Router.route('/drinks/:_id', {
  name: 'drinkPage',
  waitOn: function() {
    return [
    Meteor.subscribe('singleDrink', this.params._id),
    Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function() { return Drinks.findOne(this.params._id); }
});

Router.route('/drinks/:_id/edit', {
  name: 'drinkEdit',
  waitOn: function() {
    return Meteor.subscribe('singleDrink', this.params._id);
  },
  data: function() { return Drinks.findOne(this.params._id); }
});

Router.route('/submit', {name: 'drinkSubmit'});

var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
}

Router.onBeforeAction('dataNotFound', {only: 'drinkPage'});
Router.onBeforeAction(requireLogin, {only: 'drinkSubmit'});
