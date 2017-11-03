var replace = require('./replace');

/**
 * @class
 * @param {string} content
 * @param {Object[]} patterns
 * @param {Object} siteinfo
 */
function Fixer (content, patterns, siteinfo) {
  this.content = content;
  this.patterns = patterns;
  this.siteinfo = siteinfo;
}

/**
 * @param {Function} handleChange Callback to approve/reject the change.
 *  To skip this file entirely, throw a SkipFileError error.
 * @param {Object} handleChange.pattern
 * @param {string} handleChange.line
 * @param {undefined} handleChange.return
 * @return {Promise}
 */
Fixer.prototype.run = async function (handleChange) {
  var lines = this.content.split('\n');
  var summaries = {};
  var major = false;
  var output;

  for (let pattern of this.patterns) {
    // If we reached a minor pattern, but had no major patterns yet, don't propose
    // other changes. The edit handler requires at least one major change.
    if (!pattern.summary && !major) {
      continue;
    }
    for (let i = 0; i < lines.length; i++) {
      let replacement = replace(lines[i], pattern, this.siteinfo);
      let accept = await handleChange(lines, i, lines[i], replacement);
      if (accept === true) {
        lines[i] = replacement;
        if (pattern.summary) {
          major = true;
          summaries[pattern.summary] = true;
        }
      }
    }
  }

  // Strip nulled lines
  output = lines.filter(function (line) {
    return line !== null;
  });
  return {
    content: output.join('\n'),
    summaries: Object.keys(summaries)
  };
};

module.exports = Fixer;
