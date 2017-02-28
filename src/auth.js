var colors = require('colors/safe');
var fs = require('fs');
var opener = require('opener');
var path = require('path');
var mkdirp = require('mkdirp');

var ask = require('./ask');
var { AbortError } = require('./error');

function saveAuth (authFile) {
  var obj = {};
  var url = 'https://en.wikipedia.org/wiki/Special:BotPasswords';
  return ask.confirm('Go to ' + colors.bold.underline(url) + '?')
  .then(function (answer) {
    if (answer) {
      opener(url);
    }
  }).then(function () {
    return ask.input('Bot username?', function (data, callback) {
      obj.botname = data.trim();
      callback();
    });
  }).then(function () {
    return ask.secret('Bot password token?', function (data, callback) {
      obj.botpass = data.trim();
      callback();
    });
  }).then(function () {
    mkdirp.sync(path.dirname(authFile));
    fs.writeFileSync(authFile, JSON.stringify(obj), {
      mode: 0o600
    });
    console.log('Saved to ' + authFile);
    return obj;
  });
}

function askLogin (authFile) {
  return ask.options('Log in?', {
    yes: function (callback) {
      // de-promisify
      return saveAuth(authFile).then(callback.bind(null, null), callback);
    },
    no: function (callback) {
      callback(new AbortError());
    }
  });
}

function getAuth (authDir) {
  var authFile = path.join(authDir, '.mwauth.json');
  return new Promise(function (resolve) {
    var data = fs.readFileSync(authFile);
    var obj = JSON.parse(data);
    if (!obj.botname || !obj.botpass) {
      throw new Error('.mwauth.json must contain "botname" and "botpass".');
    }
    console.log(
      colors.green('Using credentials from %s for %s'),
      authFile,
      colors.bold(obj.botname)
    );
    resolve(obj);
  }).catch(function () {
    console.log(colors.red.bold('> Failed to read ' + path.basename(authFile) + '.'));
    return askLogin(authFile);
  });
}

module.exports.getAuth = getAuth;
