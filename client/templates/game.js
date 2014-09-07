Template.game.nonCzarPlayers = function() {
  var players = [];
  for (var i = 0; i < this.players.length; i ++) {
    var p = this.players[i];
    if (p.id === Meteor.user()._id) {
      continue;
    }
    p.selectedAnswer = this.selectedAnswers[i];
    players.push(p);
  }
  return players;
};

Template.game.canJoin = function() {
  return Meteor.user() != null &&
    getCurrentPlayer(this.players) == null &&
    this.status == 'setup';
};

Template.game.hasEnoughPlayers = function() {
  return this.players.length >= 2; // 3
};
Template.game.isCzar = function() {
  return Meteor.user() && Meteor.user()._id == this.czar;
};
Template.game.isCreator = function() {
  return Meteor.user() && Meteor.user()._id == this.creator;
};

Template.game.creatorName = function() {
  return _.findWhere(this.players, {id: this.creator}).name;
};

Template.game.isSetup = function() {
  return this.status === 'setup';
};

Template.game.isAnswering = function() {
  return this.status === 'answering';
};

Template.game.isSelectingWinner = function() {
  return this.status === 'selectingWinner';
};

Template.game.question = function() {
  return this.questions[0];
};

Template.game.isJoined = function() {
  return getCurrentPlayer(this.players) != null;
};

Template.game.hasAnswered = function() {
  return hasAnswered(this);
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
  return _.map(this.selectedAnswers, function(a) {
    return {selectedAnswer: a};
  });
};

Template.answers.isCzar = function(parent) {
  return Meteor.user() && Meteor.user()._id == parent.czar;
};

Template.answers.events({
  'click a': function(e, t) {
    e.preventDefault();
    var gameId = t.data._id;
    Meteor.call('selectWinner', gameId, this.selectedAnswer);
  }
});


Template.hand.answers = function() {
  var player = getCurrentPlayer(this.players);
  if (player === null) return;
  var answers = [];
  for (var i = 0; i < player.answers.length; i++) {
    var answer = player.answers[i];
    if (hasAnswered(this) || answer !== Session.get('selectedAnswer')) {
      var clazz = 'hidden';
    } else {
      var clazz = '';
    }
    answers.push({
      answer: answer,
      clazz: clazz
    });
  }
  return answers;
};

Template.hand.events({
  'click a': function(e, t) {
    e.preventDefault();
    if (Session.get('selectedAnswer') === this.answer) {
      Session.set('selectedAnswer', null);
    } else {
      Session.set('selectedAnswer', this.answer);
    }
  },
  'click button': function(e, t) {
    e.preventDefault();
    var gameId = t.data._id;
    Meteor.call('selectAnswer', gameId, this.answer, function(error, result) {
      if (error) console.log(error); // TODO handle?
      Session.set('selectedAnswer', null);
    });
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

function hasAnswered(game) {
  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].id === Meteor.user()._id &&
        game.selectedAnswers[i]) {
      return true;
    }
  }
  return false;
}