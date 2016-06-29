var colors = require('colors/safe');
var read = require('read');

var abbrev = require('./abbrev');

/**
 * Ask a multiple-choice question.
 *
 * Example:
 *
 *     ask.options('Continue?', {
 *         yes: function (callback) {
 *             callback();
 *         }
 *     });
 *
 * @param {string} question
 * @param {Object} handlers Callback functions by choice keys (must be lowercase)
 * @return {Promise}
 */
function options(question, handlers) {
	var keys = Object.keys(handlers);
	var mapping = abbrev(keys);
	var shorts = abbrev(keys, { shortest: true });
	var answers = {};
	for (var short in shorts) {
		answers[shorts[short]] = colors.bold(short) + shorts[short].slice(short.length);
	}
	var legend = keys.map( key => answers[key] );
	var text = question + ' (' + legend.join('/') + ') ';
	return new Promise(function (resolve, reject) {
		function prompt() {
			read({ prompt: text }, function (err, answer) {
				if (err) {
					reject(err);
					return;
				}
				var key = answer.toLowerCase();
				if (!mapping.hasOwnProperty(key)) {
					prompt();
					return;
				}
				handlers[mapping[key]](function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
		prompt();
	});
}

/**
 * Ask a boolean question.
 *
 * Example:
 *
 *     ask.options('Do it?').then(function (answer) {
 *         // answer = boolean true or false
 *     });
 *
 * @param {string} question
 * @return {Promise}
 */
function confirm(question) {
	return options(question, {
		yes: function (callback) {
			callback(null, true);
		},
		no: function (callback) {
			callback(null, false);
		}
	});
}

/**
 * Ask an open question.
 *
 * Example:
 *
 *     ask.options('Username?', function (data) {
 *     });
 *
 * @param {string} question
 * @param {Function} handler
 * @return {Promise}
 */
function input(question, handler) {
	return new Promise(function (resolve, reject) {
		function prompt() {
			read({ prompt: question }, function (err, answer) {
				if (err) {
					reject(err);
					return;
				}
				if (!answer) {
					prompt();
					return;
				}
				handler(answer, function (err, data) {
					err ? reject(err) : resolve(data);
				});
			});
		}
		prompt();
	});
}

/**
 * Ask an open question.
 *
 * Example:
 *
 *     ask.options('Password?', function (data) {
 *     });
 *
 * @param {string} question
 * @param {Function} handler
 * @return {Promise}
 */
function secret(question, handler) {
	return new Promise(function (resolve, reject) {
		function prompt() {
			read({
				prompt: question,
				silent: true,
				replace: '*'
			}, function (err, answer) {
				if (answer) {
					handler(answer, function (err, data) {
						err ? reject(err) : resolve(data);
					});
				} else {
					prompt();
				}
			});
		}
		prompt();
	});
}

module.exports = { options, confirm, input, secret };
