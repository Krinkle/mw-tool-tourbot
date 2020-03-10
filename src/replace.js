var rEscape = /[|\\{}()[\]^$+*?.]/g;

function escapeRegexp (str) {
  return str.replace(rEscape, '\\$&');
}

function expandPattern (pattern, siteinfo) {
  if (pattern.source.indexOf('<siteinfo') === -1) {
    return pattern;
  }
  return new RegExp(
    pattern.source
      .replace(/<siteinfo-([a-zA-Z]+)-([a-zA-Z]+)>/g, function (match, group, key) {
        return escapeRegexp((siteinfo[group] && siteinfo[group][key]) || '');
      }),
    pattern.flags
  );
}

function fixupReplacement (result, siteinfo) {
  result = result.replace(/<siteinfo-([a-zA-Z]+)-([a-zA-Z]+)>/g, function (match, group, key) {
    return (siteinfo[group] && siteinfo[group][key]) || '';
  });
  // Allow replacements to leave empty lines behind.
  // However, if a line is meant to be removed, replacement will contain
  // '<tourbot-rm-blank>'. This is unconditionally removed.
  // If a line is empty as a consequence of this, the line will be nulled.
  if (result.indexOf('<tourbot-rm-blank>') !== -1) {
    result = result.replace('<tourbot-rm-blank>', '');
    if (result.trim() === '') {
      result = null;
    }
  }
  return result;
}

module.exports = function replace (str, pattern, siteinfo) {
  return fixupReplacement(
    str.replace(
      expandPattern(pattern.regex, siteinfo),
      pattern.replacement
    ),
    siteinfo
  );
};
