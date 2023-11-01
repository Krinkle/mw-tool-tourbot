const colors = require('colors/safe');
const read = require('read');

const abbrev = require('./abbrev');
const hasOwn = Object.hasOwnProperty;

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
async function options (question, config, handlers) {
  // The 'config' parameter is optional.
  if (!handlers) {
    handlers = config;
    config = {};
  }
  const keys = Object.keys(handlers);
  const mapping = abbrev(keys);
  const shorts = abbrev(keys, { shortest: true });
  const answers = {};
  for (const short in shorts) {
    answers[shorts[short]] = colors.bold(short) + shorts[short].slice(short.length);
  }
  const legend = keys.map(key => answers[key]);
  const text = question + ' (' + legend.join('/') + ') ';
  config.prompt = text;
  async function prompt () {
    const answer = await read(config);
    const key = answer.toLowerCase();
    if (!hasOwn.call(mapping, key)) {
      return await prompt();
    }
    return await handlers[mapping[key]]();
  }
  return await prompt();
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
    yes: function () {
      return true;
    },
    no: function () {
      return false;
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
  async function prompt () {
    const answer = await read({ prompt: question });
    if (!answer) {
      return await prompt();
    }
    return answer;
  }
  return await prompt();
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
  async function prompt () {
    let err, answer;
    try {
      answer = await read({
        prompt: question,
        silent: true,
        replace: '*'
      });
    } catch (e) {
      err = e;
    }
    if (err || !answer) {
      return await prompt();
    }
    return answer;
  }
  return await prompt();
}

module.exports = { options, confirm, input, secret };
