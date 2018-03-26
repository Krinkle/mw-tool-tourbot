var acorn = require('acorn');
var colors = require('colors/safe');

var ask = require('./ask');
var { SkipFileError } = require('./error');

/**
 * @private
 */
async function checkScript (content, options) {
  /**
   * @return {Promise}
   */
  function confirmError (error) {
    var line = content.split('\n')[error.loc.line - 1];
    var context = line.slice(0, error.loc.column) +
      colors.bold.underline(line[error.loc.column]) +
      line.slice(error.loc.column + 1);
    return ask.options(
      colors.red.bold(error.toString()) +
        '\n' + context +
        '\n\nContinue?',
      {
        yes: function (callback) {
          callback();
        },
        no: function (callback) {
          callback(new SkipFileError('Script error'));
        }
      }
    );
  }
  if (options.quiet) {
    acorn.parse(content, { ecmaVersion: 5 });
  } else {
    try {
      acorn.parse(content, { ecmaVersion: 5 });
    } catch (e) {
      return confirmError(e);
    }
  }
}

/**
 * @param {Object} subject
 * @param {string} subject.pageName
 * @param {string} content
 * @param {Object} [options]
 * @param {boolean} [options.quiet=false] In quiet mode, a script error will
 * automatically result in an exception that skips the file. By default, a
 * script error results in an interactive prompt asking the user to decide
 * whether to skip the file, or to override the error and process anyway.
 */
async function checkSubject (subject, content, options = {}) {
  if (subject.pageName.slice(-4) === '.css') {
    return;
  }
  return checkScript(content, options);
}

module.exports = { checkSubject };
