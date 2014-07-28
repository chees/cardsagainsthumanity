Template.createGame.events({
  'click button': function(e) {
    Games.insert(getNewGame(), function(error, id) {
      if (id) {
        Router.go('game', {_id: id});
      }
    });
  }
});


Template.games.games = function() {
  return Games.find();
};



Template.game.showNameForm = function() {
  // When the collection isn't loaded yet, this seems to be window:
  if (this === window) return false;
  if (this.status === 'started') return false;

  return getCurrentPlayer(this.players) === null;
};

Template.game.isStarted = function() {
  return this.status === 'started';
};

Template.game.question = function() {
  return this.questions[0];
};

Template.game.events({
  'submit': function(e) {
    e.preventDefault();
    
    var name = $('input[name="name"]').val();
    if (name.trim() === '') return;

    if (getCurrentPlayer(this.players) !== null) {
      // Player already joined this game
      return;
    }

    var player = {
      sessionId: Meteor.connection._lastSessionId,
      name: name,
      score: 0,
      answers: []
    };
    Games.update(this._id, {$push: { players: player }});
  },
  'click button[name="start"]': function(e) {
    Meteor.call('startGame', this._id);
  }
});


Template.hand.answers = function() {
  var player = getCurrentPlayer(this.players);
  if (player === null) return;
  return player.answers;
};


function getCurrentPlayer(players) {
  var sessionId = Meteor.connection._lastSessionId;
  for (var i = 0; i < players.length; i++) {
    if (players[i].sessionId === sessionId) {
      return players[i];
    }
  }
  return null;
}

