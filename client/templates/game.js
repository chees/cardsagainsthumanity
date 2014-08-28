Template.game.players = function() {
  var players = this.players; // TODO should I clone instead?
  for (var i = 0; i < players.length; i++) {
    players[i].selectedAnswer = this.selectedAnswers[i];
  }
  return players;
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

Template.game.events({
  'click button[data-role="join"]': function(e, t) {
    Meteor.call('joinGame', this._id);
  },
  'click button[data-role="start"]': function(e, t) {
    Meteor.call('startGame', this._id);
  },
  'click button[data-role="login"]': function(e, t) {
    Meteor.loginWithGoogle();
  }
});


Template.answers.selectedAnswers = function() {
  var answers = [];
  for (var i = 0; i < this.selectedAnswers.length; i++) {
    answers.push({answer: this.selectedAnswers[i], playerPos: i});
  }
  // To prevent cheating this should actually be done on the server:
  return _.shuffle(answers);
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
    var answer = e.currentTarget.innerText;
    Meteor.call('selectAnswer', gameId, answer);
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
