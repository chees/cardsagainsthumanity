Template.createGame.events({
  'click paper-button': function(e, t) {
    Games.insert(getNewGame(), function(error, id) {
      if (id) {
        Router.go('game', {_id: id});
      } // TODO else handle error?
    });
  }
});


Template.games.games = function() {
  return Games.find({}, {sort: {creationDate: -1}});
};
