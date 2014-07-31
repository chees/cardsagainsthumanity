Template.game.isLoggedIn = function() {
  return Meteor.user();
};

Template.game.canJoin = function() {
  // When the collection isn't loaded yet, this seems to be window:
  return this !== window &&
    Meteor.user() != null &&
    getCurrentPlayer(this.players) == null &&
    this.status == 'setup';
};

Template.game.canStart = function() {
  // When the collection isn't loaded yet, 'this' seems to be window:
  return this !== window &&
    Meteor.user() != null &&
    getCurrentPlayer(this.players) != null &&
    this.status == 'setup';
};

Template.game.isStarted = function() {
  return this.status === 'started';
};

Template.game.question = function() {
  return this.questions[0];
};

Template.game.events({
  'click button[name="join"]': function(e, t) {
    e.preventDefault();
    
    var name = Meteor.user().profile.name;

    if (getCurrentPlayer(this.players) !== null) {
      // Player already joined this game
      return;
    }

    var player = {
      id: Meteor.user()._id,
      name: name,
      score: 0,
      answers: []
    };
    Games.update(this._id, {$push: { players: player }});
  },
  'click button[name="start"]': function(e, t) {
    Meteor.call('startGame', this._id);
  }
});


Template.hand.answers = function() {
  var player = getCurrentPlayer(this.players);
  if (player === null) return;
  return player.answers;
};

Template.hand.events({
  'click a': function(e, t) {
    e.preventDefault();
    var gameId = t.data._id;
    var playerId = Meteor.user()._id;
    var answer = e.target.innerText;
    Meteor.call('selectAnswer', gameId, playerId, answer);
  }
});



function getCurrentPlayer(players) {
  var user = Meteor.user();
  if (user == null) return null;

  for (var i = 0; i < players.length; i++) {
    if (players[i].id === user._id) {
      return players[i];
    }
  }
  return null;
}
