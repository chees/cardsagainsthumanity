Games = new Meteor.Collection('games');


Router.map(function() {
  this.route('home', {path: '/'});
  this.route('about');
  this.route('game', { 
    path: '/games/:_id',
    data: function() {
      return Games.findOne(this.params._id);
    },
    onBeforeAction: function(e) {      
      var sessionId = Meteor.connection._lastSessionId;

      var players = this.data().players;
      for (var i = 0; i < players.length; i++) {
        if (players[i].sessionId == sessionId) {
          return;
        }
      }
      
      console.log('adding new player to game');
      var player = { sessionId: sessionId, name: 'naampje' };
      Games.update(this.params._id, {$push: { players: player }});
    }
  });
});

Router.configure({
  layoutTemplate: 'layout' //,
  //notFoundTemplate: 'notFound',
  //loadingTemplate: 'loading'
});
