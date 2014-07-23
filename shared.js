//Players = new Meteor.Collection('players');

//Questions = new Meteor.Collection('questions');

//Answers = new Meteor.Collection('answers');

Games = new Meteor.Collection('games');


Router.map(function() {
  this.route('home', {path: '/'});
  this.route('about');
  this.route('game', { 
    path: '/games/:_id',
    data: function() { return Games.findOne(this.params._id); }
  });
});

Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});
