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
	var legend = abbrev(keys, { shortest: true });
	var answers = [];
	for (var key in legend) {
		answers.push(colors.bold(key) + legend[key].slice(key.length));
	}
	var text = question + ' (' + answers.join('/') + ') ';
	return new Promise(function (resolve, reject) {
		function prompt() {
			read({ prompt: text }, function (err, answer) {
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

module.exports = { options, input, secret };
