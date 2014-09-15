Template.layout.userPicture = function() {
  if (Meteor.user().services)
    return Meteor.user().services.google.picture;
  return '';
};

Template.layout.czarClass = function() {
  if (Meteor.user() && Meteor.user()._id == this.czar)
    return 'czar';
  return '';
};

Template.layout.homeClass = function() {
  if ($.isEmptyObject(this)) return '';
  return 'rotate';
};
