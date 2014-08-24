Package.describe({
  summary: "Adds polymer functionality to Meteor"
});

Package.on_use(function (api) {
  
  api.add_files(['lib/server/platform.js'], 'server', {isAsset: true});
  api.add_files(['lib/server/inject.js'], 'server');

  //api.add_files(["platform.js"], where);
  api.add_files(['import.js'], 'client');
});
