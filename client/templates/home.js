Template.createGame.events({
  'click paper-button[data-role="newGame"]': function(e, t) {
    Meteor.call('createGame', function(error, id) {
      if (id) {
        Router.go('game', {_id: id});
      } // TODO else handle error?
    });
    /*
    Games.insert(getNewGame(), function(error, id) {
      if (id) {
        Router.go('game', {_id: id});
      } // TODO else handle error?
    });
    */
  },
  'click paper-button[data-role="login"]': function(e, t) {
    Meteor.loginWithGoogle();
  }
});


Template.games.games = function() {
  return Games.find({}, {sort: {creationDate: -1}});
};
