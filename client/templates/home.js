Template.createGame.events({
  'click button[data-role="newGame"]': function(e, t) {
    Meteor.call('createGame', function(error, id) {
      if (id) {
        Router.go('game', {_id: id});
      } // TODO else handle error?
    });
  },
  'click button[data-role="login"]': function(e, t) {
    //Meteor.loginWithGoogle();
    Meteor.loginWithFacebook();
  }
});


Template.games.games = function() {
  return Games.find({}, {sort: {creationDate: -1}});
};
