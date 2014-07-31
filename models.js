Games = new Meteor.Collection('games');

getNewGame = function() {
  return {
    status: 'setup',
    questions: _.shuffle(getDefaultQuestions()),
    answers: _.shuffle(getDefaultAnswers()),
    players: [],
    selectedAnswers: [],
    czar: 0
  }// TODO creationDate?
};

function getDefaultQuestions() {
  return [
    "How did I lose my virginity?",
    "Why can't I sleep at night?"
  ];
};

function getDefaultAnswers() {
  return [
    "Being on fire.",
    "Racism.",
    "Old-people smell.",
    "A micropenis.",
    "Women in yogurt commercials.",
    "Classist undertones.",
    "Not giving a shit about the Third World.",
    "Inserting a mason jar into my anus.",
    "Court-ordered rehab.",
    "A windmill full of corpses.",
    "The gays.",
    "An oversized lollipop.",
    "African children.",
    "An asymmetric boob job.",
    "Bingeing and purging.",
    "The hardworking Mexican.",
    "An Oedipus complex.",
    "A tiny horse.",
    "Boogers.",
    "Penis envy.",
    "Barack Obama.",
    "My humps.",
    "The Tempurpedic Swedish Sleep System.",
    "Scientology.",
    "Dry heaving.",
    "Skeletor.",
    "Darth Vader.",
    "Figgy pudding.",
    "Advice from a wise, old black man.",
    "Five-Dollar Footlongs.",
    "Elderly Japanese men.",
    "Free samples.",
    "Estrogen.",
    "Sexual tension.",
    "Famine.",
    "A stray pube.",
    "Men.",
    "Heartwarming orphans.",
    "Chunks of dead hitchhiker.",
    "A bag of magic beans."
  ];
};
