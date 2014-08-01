console.log('on the server');

Meteor.startup(function () {
  //Games.remove({});
});

Meteor.methods({
  startGame: function (id) {
    var game = Games.findOne(id);
    if (game.status !== 'setup') {
      return;
    }
    // TODO check to make sure you can only start your own game

    console.log('Starting game ' + id);

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

    // Take selected answers from players
    for (var i = 0; i < game.players.length; i++) {
      removeOne(game.selectedAnswers[i], game.players[i].answers);
    }

    // TODO give new answers to players

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
