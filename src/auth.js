var colors = require('colors/safe');
var fs = require('fs');
var opener = require('opener');
var path = require('path');

var ask = require('./ask');
var { AbortError } = require('./error');

async function saveAuth (authFile) {
  var obj = {};
  var url = 'https://en.wikipedia.org/wiki/Special:BotPasswords';
  var answer = await ask.confirm('Go to ' + colors.bold.underline(url) + '?');
  if (answer) {
    opener(url);
  }
  var data;
  data = await ask.input('Bot username?');
  obj.botname = data.trim();
  data = await ask.secret('Bot password token?');
  obj.botpass = data.trim();

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  fs.writeFileSync(authFile, JSON.stringify(obj), {
    mode: 0o600
  });
  console.log('Saved to ' + authFile);

  return obj;
}

function askLogin (authFile) {
  return ask.options('Log in?', {
    yes: function (callback) {
      // de-promisify
      saveAuth(authFile).then(callback.bind(null, null), callback);
    },
    no: function (callback) {
      callback(new AbortError());
    }
  });
}

async function getAuth (authFile) {
  try {
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
    return obj;
  } catch (err) {
    console.log(colors.red.bold('> Failed to read ' + path.basename(authFile) + '.'));
    if (err instanceof SyntaxError) {
      console.error(err);
    }
    return askLogin(authFile);
  }
}

module.exports.getAuth = getAuth;
