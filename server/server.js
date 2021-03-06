// Routes for Google Managed VMs:
Router.route('/_ah/health', {where: 'server'})
  .get(function () {
    this.response.end('ok');
  });

Router.route('/_ah/start', {where: 'server'})
  .get(function () {
    this.response.end('ok');
  });

Router.route('/_ah/stop', {where: 'server'})
  .get(function () {
    this.response.end('ok');
  });


Meteor.startup(function () {
  //Games.remove({});
});


Meteor.publish('games', function () {
  // TODO publish only required fields
  return Games.find({}, {sort: {creationDate: -1}});
});

Meteor.publish('game', function(gameId) {
  // TODO don't publish selectedAnswers to everybody
  return Games.find({_id: gameId});
});

Meteor.publish('userData', function () {
  if (this.userId) {
    return Meteor.users.find(
      {_id: this.userId},
      //{fields: {'services.google.picture': 1}});
      {fields: {'services.facebook.id': 1}});
  } else {
    this.ready();
  }
});


Meteor.methods({
  createGame: function() {
    if (!Meteor.user()) {
      return;
    }

    var game = {
      status: 'setup', // setup, answering, selectingWinner, showingWinner
      questions: _.shuffle(getDefaultQuestions()),
      answers: _.shuffle(getDefaultAnswers()),
      players: [newPlayer()],
      selectedAnswers: [],
      shuffledAnswers: [],
      czar: Meteor.user()._id,
      creationDate: new Date().getTime(),
      creator: Meteor.user()._id,
      roundWinner: null,
      roundWinnerAnswer: null
    }
    return Games.insert(game);
  },
  joinGame: function(gameId) {
    if (!Meteor.user()) {
      return;
    }

    var game = Games.findOne(gameId);
    if (game.status !== 'setup') {
      return;
    }

    var user = Meteor.user();

    var playerIds = _.pluck(game.players, 'id');
    if (_.contains(playerIds, user._id)) {
      // User already joined this game
      return;
    }

    var player = newPlayer();
    Games.update(gameId, {$push: { players: player }});
  },
  startGame: function (gameId) {
    if (!Meteor.user()) {
      return;
    }

    var game = Games.findOne(gameId);
    if (game.status !== 'setup' || Meteor.user()._id != game.creator) {
      return;
    }

    var a = game.answers;
    var p = game.players;

    // give 10 answer cards to each player
    for (var i = 0; i < p.length; i++) {
      while (p[i].answers.length < 10) {
        p[i].answers.push(a.pop());
      }
    }

    Games.update(gameId, {$set: {
      status: 'answering',
      answers: a,
      players: p
    }});
  },
  selectAnswer: function(gameId, answer) {
    // TODO this method can be called by multiple people at the
    // same time, so make sure race conditions are not an issue
    if (!Meteor.user()) {
      return;
    }

    var game = Games.findOne(gameId);
    if (game.status !== 'answering') {
      return;
    }

    var pos = getPlayerPosition(game, Meteor.user()._id);
    game.selectedAnswers[pos] = answer;

    var set = { selectedAnswers: game.selectedAnswers };
    if (everybodyAnswered(game)) {
      set.status = 'selectingWinner';
      set.shuffledAnswers = _.shuffle(game.selectedAnswers);
    }
    Games.update(gameId, {$set: set});
  },
  selectWinner: function(gameId, answer) {
    if (!Meteor.user()) {
      return;
    }

    var game = Games.findOne(gameId);
    if (game.status !== 'selectingWinner' ||
        game.czar !== Meteor.user()._id) {
      return;
    }

    delete game._id;

    // Update status
    game.status = 'showingWinner';

    for (var i = 0; i < game.players.length; i++) {
      // Update score
      if (game.selectedAnswers[i] === answer) {
        game.players[i].score++;
        game.roundWinner = game.players[i].id;
      }
      // Take selected answers from players
      removeOne(game.selectedAnswers[i], game.players[i].answers);
    }

    game.roundWinnerAnswer = answer;

    giveAnswersToPlayers(game);

    // Select a new czar (TODO base on round winner?)
    var playerIds = _.pluck(game.players, 'id');
    var newCzarPos = (playerIds.indexOf(game.czar) + 1) % playerIds.length;
    game.czar = playerIds[newCzarPos];

    Games.update(gameId, { $set: game });
  },
  nextRound: function(gameId) {
    if (!Meteor.user()) {
      return;
    }

    var game = Games.findOne(gameId);
    if (game.status !== 'showingWinner' ||
        game.czar !== Meteor.user()._id) {
      return;
    }

    Games.update(gameId, {$set: {
      status: 'answering',
      questions: _.tail(game.questions),
      selectedAnswers: []
    }});
  }
});

function getPlayerPosition(game, playerId) {
  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].id === playerId)
      return i;
  }
}

function everybodyAnswered(game) {
  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].id == game.czar)
      continue;
    if (game.selectedAnswers[i] == null)
      return false;
  }
  return true;
}

/** Removes only one item (not all) from the given list. */
function removeOne(item, list) {
  list.splice(list.indexOf(item), 1);
}

function giveAnswersToPlayers(game) {
  _.each(game.players, function(p) {
    while (p.answers.length < 10)
      p.answers.push(game.answers.pop());
  });
}

function newPlayer() {
  var user = Meteor.user();
  var nameWords = user.profile.name.split(' ');
  var initials = nameWords[0][0];
  if (nameWords.length > 1) {
    initials += nameWords[nameWords.length-1][0];
  }
  return {
    id: user._id,
    name: user.profile.name,
    score: 0,
    answers: [],
    //picture: user.services.google.picture,
    picture: 'http://graph.facebook.com/' + user.services.facebook.id + '/picture/?type=large',
    initials: initials.toUpperCase()
  };
}


// TODO move these to some other file?
function getDefaultQuestions() {
  return [
    "How did I lose my virginity?",
    "Why can't I sleep at night?",
    "What's that smell?",
    "I got 99 problems but ___ ain't one.",
    "Maybe she's born with it. Maybe it's ___.",
    "What's the next Happy Meal toy?",
    "Here is the church\nHere is the steeple\nOpen the doors\nAnd there is ___.",
    "It's a pity that kids these days are all getting involved with ___.",
    "Today on Maury: \"Help! My son is ___!\"",
    "Alternative medicine is now embracing the curative powers of ___.",
    //"And the Academy Award for ___ goes to ___.", // Pick 2
    "What's that sound?",
    "What ended my last relationship?",
    "MTV's new reality show features eight washed-up celebrities living with ___.",
    "I drink to forget ___.",
    "I'm sorry, Professor, but I couldn't complete my homework because of ___.",
    "What is Batman's guilty pleasure?",
    "This is the way the world ends\nThis is the way the world ends\nNot with a bang but with ___.",
    "What's a girl's best friend?",
    "TSA guidelines now prohibit ___ on airplanes.",
    "___ That's how I want to die.",
    //"For my next trick, I will pull ___ out of my ___.", // Pick 2
    "In the new Disney Channel Original Movie, Hannah Montana struggles with ___ for the first time.",
    //"___ is a slippery slope that leads to ___.", // Pick 2
    "I get by with a little help from ___.",
    "Dear Abby,\nI'm having some trouble with ___ and would like your advice.",
    "Instead of coal, Santa now gives the bad children ___.",
    "What's the most emo?",
    "In 1,000 years, when paper money is a distant memory, how will we pay for goods and services?",
    //"Introducing the amazing superhero/sidekick duo! It's ___ and ___!", // Pick 2
    //"In M. Night Shyamalan's new movie, Bruce Willis discovers that ___ had really been ___ all along.", // Pick 2
    "A romantic, candlelit dinner would be incomplete without ___.",
    "___. Betcha can't have just one!",
    "White people like ___.",
    "___. High five, bro.",
    "Next from J.K. Rowling: Harry Potter and the Chamber of ___.",
    "Introducing Xtreme Baseball! It's like baseball but with ___!",
    //"In a world ravaged by ___, out only solace is ___.", // Pick 2
    "War!\nWhat is it good for?",
    "During sex, I like to think about ___.",
    "What are my parents hiding from me?",
    "What will always get you laid?",
    "In L.A. County Jail, word is you can trade 200 cigarettes for ___.",
    "What did I bring back from Mexico?",
    "What don't you want to find in your Kung Pao chicken?",
    "What will I bring back in time to convince people that I am a powerful wizard?",
    "How am I maintaining my relationship status?",
    "___. It's a trap!",
    "Coming to Broadway this season, ___: The Musical.",
    "While the United States raced the Soviet Union to the moon, the Mexican government funneled millions of pesos into research on ___.",
    "After the earthquake, Sean Penn brought ___ to the people of Haiti.",
    "Next on ESPN2, the World Series of ___.",
    //"Step 1: ___.\nStep 2: ___.\nStep 3: Profit.", // Pick 2
    //"They said we were crazy. They said we couldn't put ___ inside of ___. They were wrong.", // Pick 2
    "But before I kill you, Mr. Bond, I must show you ___.",
    "What gives me uncontrollable gas?",
    "The new Chevy Tahoe. With the power and space to take ___ everywhere you go.",
    "The class field trip was completely ruined by ___.",
    "When Pharaoh remained unmoved, Moses called down a Plague of ___.",
    "What's my secret power?",
    "What's there a ton of in heaven?",
    "What would grandma find disturbing, yet oddly charming?",
    //"I never truly understood ___ until I encountered ___.", // Pick 2
    "What did the U.S. airdrop to the children of Afghanistan?",
    "What helps Obama unwind?",
    "What did Vin Diesel eat for dinner?",
    "___: good to the last drop.",
    "Why am I sticky?",
    "What gets better with age?",
    "___: kid-tested, mother approved.",
    "Daddy, why is mommy crying?",
    "What's Teach for America using to inspire inner city students to succeed?",
    "A recent laboratory study shows that undergraduates have 50% less sex after being exposed to ___.",
    "Life for American Indians was forever changed when the White Man introduced them to ___.",
    //"Make a haiku.", // Draw 2, Pick 3
    "I do not know with what weapons World War III will be fought, but World War IV will be fought with ___.",
    "Why do I hurt all over?",
    "What am I giving up for Lent?",
    "What's George W. Bush thinking about right now?",
    "The Smithsonian Museum of Natural History has just opened an interactive exhibit on ___.",
    "When I am President of the United States, I will create the Department of ___.",
    //"Lifetime presents \"___, the Story of ___.\"", // Pick 2
    "When I am a billionaire, I shall erect a 50-foot statue to commemorate ___.",
    //"When I was tripping on acid, ___ turned into ___.", // Pick 2
    //"That's right, I killed ___. How you ask? ___.", // Pick 2
    "What's my anti-drug?",
    //"___ + ___ = ___.", // Draw 2, Pick 3
    "What never fails to liven up the party?",
    "What's the new fad diet?",
    "Fun tip! When your man asks you to go down on him, try surprising him with ___ instead."
  ];
};

function getDefaultAnswers() {
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
    "A bag of magic beans.",
    "Repression.",
    "Prancing.",
    "My relationship status.",
    "Overcompensation.",
    "Peeing a little bit.",
    "Pooping back and forth. Forever.",
    "A ball of earwax, semen and toenail clippings.",
    "Testicular torsion.",
    "The Devil himself.",
    "The World of Warcraft.",
    "Dick Cheney.",
    "MechaHitler.",
    "Being fabulous.",
    "Pictures of boobs.",
    "A gentle caress of the inner thigh.",
    "The Amish.",
    "The rhythms of Africa.",
    "Lance Armstrong's missing testicle.",
    "Pedophiles.",
    "The Pope.",
    "Flying sex snakes.",
    "Sarah Palin.",
    "Feeding Rosie O'Donnell.",
    "Sexy pillow fights.",
    "Invading Poland.",
    "Cybernetic enhancements.",
    "Civilian casualties.",
    "Jobs.",
    "The female orgasm.",
    "Bitches.",
    "The Boy Scouts of America.",
    "Auschwitz.",
    "Finger painting.",
    "The Care Bear Stare.",
    "The Jews.",
    "Being marginalized.",
    "The Blood of Christ.",
    "Dead parents.",
    "The art of seduction.",
    "Dying of dysentery.",
    "Mr. Clean, right behind you.",
    "Magnets.",
    "Jewish fraternities.",
    "Hot Pockets®.",
    "Natalie Portman.",
    "Agriculture.",
    "Judge Judy.",
    "Surprise sex!",
    "The homosexual agenda.",
    "Robert Downey, Jr.",
    "The Trail of Tears.",
    "An M. Night Shyamalan plot twist.",
    "Funky fresh rhymes.",
    "The light of a billion suns.",
    "Amputees.",
    "Throwing a virgin into a volcano.",
    "Italians.",
    "Explosions.",
    "A good sniff.",
    "Destroying the evidence.",
    "Children on leashes.",
    "Catapults.",
    "One trillion dollars.",
    "Friends with benefits.",
    "Dying.",
    "Silence.",
    "Growing a pair.",
    "YOU MUST CONSTRUCT ADDITIONAL PYLONS.",
    "Justin Bieber.",
    "The Holy Bible.",
    "Balls.",
    "Praying the gay away.",
    "Teenage pregnancy.",
    "German dungeon porn.",
    "The invisible hand.",
    "My inner demons.",
    "Powerful thighs.",
    "Getting naked and watching Nickelodeon.",
    "Crippling debt.",
    "Kamikaze pilots.",
    "Teaching a robot to love.",
    "Police brutality.",
    "Horse meat.",
    "All-you-can-eat shrimp for $4.99.",
    "Heteronormativity.",
    "Michael Jackson.",
    "A really cool hat.",
    "Copping a feel.",
    "Crystal meth.",
    "Shapeshifters.",
    "Fingering.",
    "A disappointing birthday party.",
    "The Patriarchy.",
    "My soul.",
    "A sausage festival.",
    "The chronic.",
    "Eugenics.",
    "Synergistic management solutions.",
    "RoboCop.",
    "Serfdom.",
    "Stephen Hawking talking dirty.",
    "A man on the brink of orgasm.",
    "Fiery poops.",
    "Public ridicule.",
    "White-man scalps.",
    "The morbidly obese.",
    "Object permanence.",
    "GoGurt®.",
    "Lockjaw.",
    "Joe Biden.",
    "Bio-engineered assault turtles with acid breath.",
    "Wet dreams.",
    "Hip hop jewels.",
    "Firing a rifle into the air while balls deep in a squealing hog.",
    "Panda sex.",
    "Necrophilia.",
    "Grave robbing.",
    "A bleached asshole.",
    "Muhammad (Praise Be Unto Him).",
    "Multiple stab wounds.",
    "Daniel Radcliffe's delicious asshole.",
    "A monkey smoking a cigar.",
    "Smegma.",
    "A live studio audience.",
    "Making a pouty face.",
    "The violation of our most basic human rights.",
    "Unfathomable stupidity.",
    "Sunshine and rainbows.",
    "Whipping it out.",
    "The token minority.",
    "The terrorists.",
    "The Three-Fifths compromise.",
    "A snapping turtle biting the tip of your penis.",
    "Vehicular manslaughter.",
    "The Great Depression.",
    "Emotions.",
    "Getting so angry that you pop a boner.",
    "Same-sex ice dancing.",
    "An M16 assault rifle.",
    "Man meat.",
    "Incest.",
    "A foul mouth.",
    "Flightless birds.",
    "Doing the right thing.",
    "When you fart and a little bit comes out.",
    "Frolicking.",
    "Being a dick to children.",
    "Poopy diapers.",
    "Seeing grandma naked.",
    "Raptor attacks.",
    "Swooping.",
    "Concealing a boner.",
    "Full frontal nudity.",
    "Vigorous jazz hands.",
    "Nipple blades.",
    "A bitch slap.",
    "Michelle Obama's arms.",
    "Mouth herpes.",
    "A robust mongoloid.",
    "Mutually-assured destruction.",
    "The rapture.",
    "Road head.",
    "Stalin",
    "Lactation.",
    "Hurricane Katrina.",
    "The true meaning of Christmas.",
    "Self-loathing.",
    "A brain tumor.",
    "Dead babies.",
    "New Age music.",
    "A thermonuclear detonation.",
    "Geese.",
    "Kanye West.",
    "God.",
    "A spastic nerd.",
    "Harry Potter erotica.",
    "Kids with ass cancer.",
    "Lumberjack fantasies.",
    "The American Dream.",
    "Puberty."
  ];
};
