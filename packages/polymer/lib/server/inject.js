console.log('injecting');
// See https://github.com/arunoda/meteor-fast-render/blob/master/lib/server/inject.js

var http = Npm.require('http');

var injectHtml;
Assets.getText('lib/server/platform.js', function(err, text) {
  if (err) {
    console.error('Error reading Polymer platform: ', err.message);
  } else {
    injectHtml = '<script>' + text + '</script>';
  }
});

//var injectHtml = '<script>console.log("zomg")</script>';

var originalWrite = http.OutgoingMessage.prototype.write;
http.OutgoingMessage.prototype.write = function(chunk, encoding) {
  if (!this.injected &&
      encoding === undefined &&
      /<!DOCTYPE html>/.test(chunk)) {
    console.log('injected');
    //console.log(chunk);
    try {
      chunk = chunk.replace('<head>', '<head>\n' + injectHtml + '\n');
    } catch(e) {
      console.log('doh', e);
    }
    this.injected = true;
  }
  originalWrite.call(this, chunk, encoding);
};
