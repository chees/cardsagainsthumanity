console.log('on the server');

Meteor.startup(function () {
  //Players.remove({});
  //Questions.remove({});
  //Answers.remove({});
  //Games.remove({});

  initGame();
});

function initGame() {
  if (Games.find().count() === 0) {
    Games.insert({
      status: 'setup',
      questions: _.shuffle(getDefaultQuestions()),
      answers: _.shuffle(getDefaultAnswers()),
      players: [],
      selectedAnswers: [],
      czar: 0
    });
  }
}


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
  }
});