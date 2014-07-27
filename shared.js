Games = new Meteor.Collection('games');


Router.map(function() {
  this.route('home', {path: '/'});
  this.route('about');
  this.route('game', { 
    path: '/games/:_id',
    data: function() {
      return Games.findOne(this.params._id);
    },
    onBeforeAction: function(e) {
      /*
      var sessionId = Meteor.connection._lastSessionId;

      var players = this.data().players;
      for (var i = 0; i < players.length; i++) {
        if (players[i].sessionId == sessionId) {
          return;
        }
      }
      
      console.log('adding new player to game');
      var player = { sessionId: sessionId, name: 'naampje' };
      Games.update(this.params._id, {$push: { players: player }});
      */
    }
  });
});

Router.configure({
  layoutTemplate: 'layout' //,
  //notFoundTemplate: 'notFound',
  //loadingTemplate: 'loading'
});


getDefaultQuestions = function() {
//function getDefaultQuestions() {
  return [
    "How did I lose my virginity?",
    "Why can't I sleep at night?"
  ];
};

getDefaultAnswers = function() {
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
