console.log('on the server');

Meteor.startup(function () {
  //Games.remove({});

  if (Games.find().count() === 0) {
    Games.insert(getNewGame());
  }
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
      status: 'started',
      answers: a,
      players: p
    }});
  },
  selectAnswer: function(gameId, playerId, answer) {
    // TODO check somehow that you can only set your own answer?
    console.log('selectAnswer', gameId, playerId, answer);
    var game = Games.findOne(gameId);
    var pos = getPlayerPosition(game, playerId);
    game.selectedAnswers[pos] = answer;
  }
});

function getPlayerPosition(game, playerId) {
  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].id === playerId)
      return i;
  }
}