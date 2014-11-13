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

Template.game.czarName = function() {
  return _.findWhere(this.players, {id: this.czar}).name;
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

Template.game.isShowingWinner = function() {
  return this.status === 'showingWinner';
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

Template.game.roundWinner = function() {
  var u = Meteor.user();
  if (u && u._id === this.roundWinner) {
    return "You";
  }
  return _.findWhere(this.players, {id: this.roundWinner}).name;
};

Template.game.completedQuestion = function() {
  var q = this.questions[0];
  var a = this.roundWinnerAnswer;
  if (q.indexOf('___') > -1) {
    // Remove ending '.':
    if (a[a.length-1] === '.') a = a.substring(0, a.length - 1);
    return q.replace('___', a);
  }
  return q + ' ' + a;
};

Template.game.events({
  'click button[data-role="join"]': function(e, t) {
    Meteor.call('joinGame', this._id);
  },
  'click button[data-role="start"]': function(e, t) {
    Meteor.call('startGame', this._id);
  },
  'click button[data-role="login"]': function(e, t) {
    //Meteor.loginWithGoogle();
    Meteor.loginWithFacebook();
  },
  'click button[data-role="nextRound"]': function(e, t) {
    Meteor.call('nextRound', this._id);
  }
});


Template.answers.shuffledAnswers = function() {
  return _.map(_.compact(this.shuffledAnswers), function(a) {
    return {
      shuffledAnswer: a,
      clazz: Session.get('selectedAnswer') === a ? '' : 'hidden'
    }
  });
};

Template.answers.isCzar = function(parent) {
  return Meteor.user() && Meteor.user()._id == parent.czar;
};

Template.answers.czarName = function() {
  return _.findWhere(this.players, {id: this.czar}).name;
};

Template.answers.events({
  'click a': function(e, t) {
    e.preventDefault();
    if (Session.get('selectedAnswer') === this.shuffledAnswer) {
      Session.set('selectedAnswer', null);
    } else {
      Session.set('selectedAnswer', this.shuffledAnswer);
    }
  },
  'click button': function(e, t) {
    e.preventDefault();
    var gameId = t.data._id;
    Meteor.call('selectWinner', gameId, this.shuffledAnswer);
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