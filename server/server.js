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
      questions: getDefaultQuestions(),
      answers: getDefaultAnswers(),
      players: [],
      selectedAnswers: [],
      czar: 0
    });
  }
}
