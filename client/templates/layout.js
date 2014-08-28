Template.layout.userPicture = function() {
  if (Meteor.user().services)
    return Meteor.user().services.google.picture;
  return "";
};
