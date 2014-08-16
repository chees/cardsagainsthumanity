Meteor.startup(function () {
  //Games.remove({});
});


Meteor.publish('games', function () {
  return Games.find({}, {sort: {creationDate: -1}});
});

Meteor.publish('game', function(gameId) {
  return Games.find({_id: gameId});
});

Meteor.publish('userData', function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'services.google.picture': 1}});
  } else {
    this.ready();
  }
});


Meteor.methods({
  joinGame: function(gameId) {
    var game = Games.findOne(gameId);
    if (game.status !== 'setup') {
      return;
    }

    var user = Meteor.user();

    var playerIds = _.pluck(game.players, 'id');
    if (_.contains(playerIds, user._id)) {
      // User already joined this game
      return;
    }

    var player = {
      id: user._id,
      name: user.profile.name,
      score: 0,
      answers: [],
      picture: user.services.google.picture
    };
    Games.update(gameId, {$push: { players: player }});
  },
  startGame: function (id) {
    var game = Games.findOne(id);
    if (game.status !== 'setup') {
      return;
    }

    // TODO check to make sure you can only start a game where you're the creator

    var a = game.answers;
    var p = game.players;

    // give 10 answer cards to each player
    for (var i = 0; i < p.length; i++) {
      while (p[i].answers.length < 10) {
        p[i].answers.push(a.pop());
      }
    }

    Games.update(id, {$set: {
      status: 'answering',
      answers: a,
      players: p
    }});
  },
  selectAnswer: function(gameId, playerId, answer) {
    // TODO check somehow that you can only set your own answer?
    // TODO user Meteor.user() instead of passing the playerId
    console.log('selectAnswer', gameId, playerId, answer);

    var game = Games.findOne(gameId);
    if (game.status !== 'answering') {
      return;
    }

    var pos = getPlayerPosition(game, playerId);
    game.selectedAnswers[pos] = answer;

    Games.update(gameId, {$set: { selectedAnswers: game.selectedAnswers }});
    
    if (everybodyAnswered(game)) {
      Games.update(gameId, {$set: { status: 'selectingWinner' }});
    }
  },
  selectWinner: function(gameId, playerPos) {
    // TODO check Meteor.user() to see if this user is actually the czar in this game
    console.log('selectWinner', gameId, playerPos);

    var game = Games.findOne(gameId);
    if (game.status !== 'selectingWinner') {
      return;
    }

    delete game._id;

    // Update status
    game.status = 'answering';

    // Remove the current question
    game.questions = _.tail(game.questions);

    // Update score
    game.players[playerPos].score++;

    for (var i = 0; i < game.players.length; i++) {
      // Take selected answers from players
      removeOne(game.selectedAnswers[i], game.players[i].answers);
    }

    // give new answers to players
    giveAnswersToPlayer(game);

    // Empty selectedAnswers
    game.selectedAnswers = [];

    // TODO select a new czar

    Games.update(gameId, { $set: game });
  }
});

function getPlayerPosition(game, playerId) {
  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].id === playerId)
      return i;
  }
}

function everybodyAnswered(game) {
  // TODO ignore the czar
  for (var i = 0; i < game.players.length; i++) {
    if (game.selectedAnswers[i] === undefined)
      return false;
  }
  return true;
}

/** Removes only one item (not all) from the given list. */
function removeOne(item, list) {
  list.splice(list.indexOf(item), 1);
}

function giveAnswersToPlayer(game) {
  _.each(game.players, function(p) {
    while (p.answers.length < 10)
      p.answers.push(game.answers.pop());
  });
}
