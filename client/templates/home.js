Template.createGame.events({
  'click button': function(e, t) {
    Games.insert(getNewGame(), function(error, id) {
      if (id) {
        Router.go('game', {_id: id});
      } // TODO else handle error?
    });
  }
});


Template.games.games = function() {
  return Games.find();
};
