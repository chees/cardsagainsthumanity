Template.layout.events({
  'click paper-icon-button': function(e, t) {
    Router.go('home');
  }
});

Template.layout.userPicture = function() {
  return Meteor.user().services.google.picture;
};