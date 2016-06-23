var colors = require('colors/safe');
var fs = require('fs');
var opener = require('opener');
var path = require('path');

var ask = require('./ask');
var { AbortError } = require('./error');

var authFile = path.join(__dirname, '..', '.mwauth.json');

function saveAuth() {
	var obj = {};
	var url = 'https://en.wikipedia.org/wiki/Special:BotPasswords';
	return ask.options('Go to ' + colors.bold.underline(url) + '?', {
		yes: function (callback) {
			opener(url);
			callback();
		},
		no: function (callback) {
			callback();
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
		fs.writeFileSync(authFile, JSON.stringify(obj), {
			mode: 0o600
		});
		return obj;
	});
}

function askLogin() {
	return ask.options('Log in?', {
		yes: function (callback) {
			// de-promisify
			return saveAuth().then(callback.bind(null, null), callback);
		},
		no: function (callback) {
			callback(new AbortError());
		}
	});
}

function getAuth() {
	return new Promise(function (resolve) {
		var data = fs.readFileSync(authFile);
		var obj = JSON.parse(data);
		if (!obj.botname || !obj.botpass) {
			throw new Error('.mwauth.json must contain "botname" and "botpass".');
		}
		console.log('Logging in as ' + colors.bold(obj.botname));
		resolve(obj);
	}).catch(function () {
		console.log(colors.red.bold('> Failed to read ' + path.basename(authFile) + '.'));
		return askLogin();
	});
}

module.exports.getAuth = getAuth;
