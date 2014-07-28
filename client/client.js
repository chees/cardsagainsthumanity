
/*
Template.name.events({
  'keyup input': function(e) {
    var val = $(e.target).val();
    var sessionId = Meteor.connection._lastSessionId;
    if (val) {
      //Games.update()
      var p = Players.findOne(sessionId);
      if (p) {
        Players.update(sessionId, {$set: {name: val}});
      } else {
        Players.insert({_id: sessionId, name: val})
      }
    }
  }
});
*/

/*
Template.players.player = function() {
  return Players.find();
};
Template.players.name = function() {
  return this.name;
};
*/

Template.createGame.events({
  'click button': function(e) {
    Games.insert({
      status: 'setup',
      questions: getDefaultQuestions(),
      answers: getDefaultAnswers(),
      players: [],
      selectedAnswers: [],
      czar: 0
    }, function(error, id) {
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
  console.log('player', player);
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

