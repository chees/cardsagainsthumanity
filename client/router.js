Router.map(function() {
  this.route('home', {
    path: '/',
    waitOn: function() {
      // TODO maybe also wait on user data since it takes a while
      // for Meteor to notice that you're already logged in
      return Meteor.subscribe('games');
    }
  });
  this.route('about');
  this.route('game', { 
    path: '/games/:_id',
    data: function() {
      return Games.findOne(this.params._id);
    },
    waitOn: function() {
      return Meteor.subscribe('game', this.params._id);
    },
    action: function() {
      // FUUUUU this seems retarded. TODO figure out a better way
      // https://github.com/EventedMind/iron-router/issues/265#issuecomment-43458971
      if (this.ready()) {
        this.render();
      }
    }
  });
});

Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});

Meteor.subscribe("userData");
