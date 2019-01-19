var { SkipPatternError } = require('./error');

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
 * @param {Function} replacer Callback to apply the replacement
 * @param {string} replacer.str Input line
 * @param {Object} replacer.pattern
 * @param {Object} replacer.siteinfo
 * @return {string|null} replacer.return Replacement line or null to remove
 *
 * @param {Function} accepter Callback (maybe be async) to approve/reject
 *  the change. May throw to skip the file.
 * @return {bool} accepter.return Whether to accept the replacement
 *
 * @return {Object}
 */
Fixer.prototype.run = async function (replacer, accepter) {
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
    try {
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        while (true) {
          if (line === null) {
            // If the line was removed by a previous pattern, skip it
            break;
          }
          let replacement = replacer(line, pattern, this.siteinfo);
          if (replacement === line) {
            // This pattern doesn't match, or matched previously
            // but not anymore.
            break;
          }
          let accept = await accepter(lines, i, line, replacement, pattern);
          if (accept !== true) {
            // Don't propose the same pattern multiple times,
            // given the next match would be the same.
            break;
          }
          line = replacement;
          if (pattern.summary) {
            major = true;
            summaries[pattern.summary] = true;
          }
        }
        lines[i] = line;
      }
    } catch (err) {
      if (err instanceof SkipPatternError) {
        // Thrown by cli.proposeChange (known as 'accepter' here)
        continue;
      }
      throw err;
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
