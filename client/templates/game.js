Template.game.players = function() {
  var players = this.players; // TODO should I clone instead?
  for (var i = 0; i < players.length; i++) {
    players[i].selectedAnswer = this.selectedAnswers[i];
  }
  return players;
};

Template.game.isLoggedIn = function() {
  return Meteor.user();
};

Template.game.canJoin = function() {
  return Meteor.user() != null &&
    getCurrentPlayer(this.players) == null &&
    this.status == 'setup';
};

Template.game.canStart = function() {
  return Meteor.user() != null &&
    getCurrentPlayer(this.players) != null &&
    this.status == 'setup';
};

Template.game.isSetup = function() {
  return this.status === 'setup';
};

Template.game.question = function() {
  return this.questions[0];
};

Template.game.isJoined = function() {
  return getCurrentPlayer(this.players) != null;
};

Template.game.isSelectingWinner = function() {
  return this.status === 'selectingWinner';
};

// TODO set a listener on the answer so select the winner

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


Template.answers.selectedAnswers = function() {
  var answers = [];
  for (var i = 0; i < this.selectedAnswers.length; i++) {
    answers.push({answer: this.selectedAnswers[i], playerPos: i});
  }
  return _.shuffle(answers); // To prevent cheating this should actually be done on the server
};

Template.answers.events({
  'click a': function(e, t) {
    e.preventDefault();
    var gameId = t.data._id;
    var playerPos = $(e.target).attr('data-pos');
    Meteor.call('selectWinner', gameId, playerPos);
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
