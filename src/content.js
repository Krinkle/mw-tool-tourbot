const acorn = require('acorn');
const colors = require('colors/safe');

const ask = require('./ask');
const { SkipFileError } = require('./error');

function parse (subject, content) {
  if (subject.ecmaVersion === null || subject.ecmaVersion === undefined) {
    // Initial parse when reading current page content
    try {
      // Try as ES2016 (ES7)
      acorn.parse(content, { ecmaVersion: 2016 });
      subject.ecmaVersion = 2016;
    } catch (e1) {
      // Re-try as ES2020
      try {
        acorn.parse(content, { ecmaVersion: 2020 });
        subject.ecmaVersion = 2020;
      } catch (e2) {
        throw e1;
      }
    }
  } else {
    // Re-parse after fixes, with the same version as before
    acorn.parse(content, { ecmaVersion: subject.ecmaVersion });
  }
}

/**
 * @private
 */
async function checkScript (subject, content, options) {
  /**
   * @return {Promise}
   */
  function confirmError (error) {
    const line = content.split('\n')[error.loc.line - 1];
    let context;
    // Fallback to empty string because the error may be that
    // the script ended unexpectedly, in which case the column
    // is length+1, which yields undefined and we don't want
    // to display a String(undefined) as part of the preview.
    if (line[error.loc.column] !== undefined) {
      context = line.slice(0, error.loc.column) +
        colors.bold.underline(line[error.loc.column]) +
        line.slice(error.loc.column + 1);
    } else {
      context = colors.bold.underline('End of script') + '\n' + line;
    }
    return ask.options(
      colors.red.bold(error.toString()) +
        '\n' + context +
        '\n\nContinue?',
      {
        yes: function () {},
        no: function () {
          throw new SkipFileError('Script error');
        }
      }
    );
  }
  if (options.quiet) {
    parse(subject, content);
  } else {
    try {
      parse(subject, content);
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
  if (
    (content.includes('<nowiki>') && !content.includes('</nowiki>')) ||
    (content.includes('<source') && !content.includes('</source>')) ||
    (content.includes('<syntaxhighlight') && !content.includes('</syntaxhighlight>'))
  ) {
    throw new SkipFileError('Page contains unsafe nowiki see T236828');
  }

  if (subject.pageName.includes('/monobook.css')) {
    throw new SkipFileError('Ignore non-Vector');
  }
  if (subject.pageName.includes('/simple.css')) {
    throw new SkipFileError('Ignore non-Vector');
  }
  if (subject.pageName.includes('/modern.css')) {
    throw new SkipFileError('Ignore non-Vector');
  }

  if (subject.pageName.slice(-4) === '.css') {
    return;
  }
  if (
    (
      subject.pageName.includes('Gadgets-definition') ||
      subject.pageName.includes('Centralnotice-template-')
    ) && !subject.pageName.includes('.js')
  ) {
    // "MediaWiki:Gadgets-definition"
    // "MediaWiki:Wp/khw/Gadgets-definition" (incubator.wikimedia.org)
    // "MediaWiki:Centralnotice-template-B13 121022 sldSl enYY" (meta.wikimedia.org)
    return;
  }

  return checkScript(subject, content, options);
}

module.exports = { checkSubject };
