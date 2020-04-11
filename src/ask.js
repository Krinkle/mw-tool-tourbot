var colors = require('colors/safe');
var read = require('read');

var abbrev = require('./abbrev');
var hasOwn = Object.hasOwnProperty;

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
 * @param {Object} [config] For read()'s opt parameter.
 * @param {number} [config.timeout] Abort with an error after this much time.
 * @param {Object} handlers Callback functions by choice keys (must be lowercase)
 * @return {Promise}
 */
function options (question, config, handlers) {
  // The 'config' parameter is optional.
  if (!handlers) {
    handlers = config;
    config = {};
  }
  var keys = Object.keys(handlers);
  var mapping = abbrev(keys);
  var shorts = abbrev(keys, { shortest: true });
  var answers = {};
  for (var short in shorts) {
    answers[shorts[short]] = colors.bold(short) + shorts[short].slice(short.length);
  }
  var legend = keys.map(key => answers[key]);
  var text = question + ' (' + legend.join('/') + ') ';
  config.prompt = text;
  return new Promise(function (resolve, reject) {
    function prompt () {
      read(config, function (err, answer) {
        if (err) {
          reject(err);
          return;
        }
        var key = answer.toLowerCase();
        if (!hasOwn.call(mapping, key)) {
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
 *     answer = await ask.options('Do it?');
 *
 * @param {string} question
 * @return {boolean}
 */
async function confirm (question) {
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
 *     answer = await ask.options('Username?');
 *
 * @param {string} question
 * @param {Function} handler
 * @return {string} answer
 */
async function input (question) {
  return new Promise(function (resolve, reject) {
    function prompt () {
      read({ prompt: question }, function (err, answer) {
        if (err) {
          reject(err);
          return;
        }
        if (!answer) {
          prompt();
          return;
        }
        resolve(answer);
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
 *     data = await ask.options('Password?');
 *
 * @param {string} question
 * @param {Function} handler
 * @return {string} answer
 */
async function secret (question) {
  return new Promise(function (resolve, reject) {
    function prompt () {
      read({
        prompt: question,
        silent: true,
        replace: '*'
      }, function (err, answer) {
        if (err || !answer) {
          prompt();
          return;
        }
        resolve(answer);
      });
    }
    prompt();
  });
}

module.exports = { options, confirm, input, secret };
