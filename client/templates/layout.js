Template.layout.userPicture = function() {
  if (Meteor.user().services)
    //return Meteor.user().services.google.picture;
    return 'http://graph.facebook.com/' + Meteor.user().services.facebook.id + '/picture/?type=large';
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

Template.layout.events({
  'click a[data-role="menu"]': function(e, t) {
    e.preventDefault();
    alert('Nomnomnom, hamburgers!');
  }
});