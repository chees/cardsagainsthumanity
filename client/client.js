/*
Template.cursors.cursor = function() {
  return Cursors.find();
};

Template.cursors.myCursor = function() {
  return this._id === Meteor.connection._lastSessionId;
};

Template.cursors.name = function() {
  return this.name;
};
*/

/*
Template.name.events({
  'keyup input': function(e) {
    var val = $(e.target).val();
    var sessionId = Meteor.connection._lastSessionId;
    if (val) {
      //Games.update()
      var p = Players.findOne(sessionId);
      if (p) {
        Players.update(sessionId, {$set: {name: val}});
      } else {
        Players.insert({_id: sessionId, name: val})
      }
    }
  }
});
*/

/*
Template.players.player = function() {
  return Players.find();
};
Template.players.name = function() {
  return this.name;
};
*/

Template.games.games = function() {
  return Games.find();
};

Template.game.showNameForm = function() {
  // When the collection isn't loaded yet, this seems to be window:
  if (this === window) return false;
  if (this.status === 'started') return false;

  var sessionId = Meteor.connection._lastSessionId;
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].sessionId === sessionId)
      return false;
  }

  return true;
};

Template.game.showStartButton = function() {
  return this.status === 'setup';
};

Template.game.events({
  'submit': function(e) {
    e.preventDefault();
    
    var name = $('input[name="name"]').val();
    if (name.trim() === '') return;

    var sessionId = Meteor.connection._lastSessionId;

    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].sessionId == sessionId) {
        // Player already joined this game
        return;
      }
    }
    
    var player = { sessionId: sessionId, name: name };
    Games.update(this._id, {$push: { players: player }});
  },
  'click button[name="start"]': function(e) {
    Games.update(this._id, {$set: { status: 'started' }});
  }
});

/*
Template.controls.started = function() {
  return false; // TODO
};
Template.controls.events({
  'click button': function(e) {
    console.log('click');
  }
});
*/

/*
Template.questions.question = function() {
  return Questions.find();
};
Template.questions.name = function() {
  return this.name;
};
*/

/*
UI.body.events({
  'mousemove': function(e) {
    //console.log('hier');
    var x = e.clientX;
    var y = e.clientY;
    var sessionId = Meteor.connection._lastSessionId;
    if (sessionId == null) return;
    var c = Cursors.findOne(sessionId);
    if (c)
      Cursors.update(sessionId, {$set: {x: x, y: y}})
    else
      Cursors.insert({_id: sessionId, x: x, y: y})
  }
});
*/
