var rEscape = /[|\\{}()[\]^$+*?.]/g;

function escapeRegexp(str) {
	return str.replace(rEscape, '\\$&');
}

function expandPattern(pattern, siteinfo) {
	if (pattern.source.indexOf('<siteinfo') === -1) {
		return pattern;
	}
	return new RegExp(
		pattern.source.replace(/<siteinfo\-([a-z]+)>/g, function (match, key) {
			return escapeRegexp(siteinfo[key] || '');
		}),
		pattern.flags
	);
}

function fixupReplacement(str) {
	// Allow replacements to leave empty lines behind.
	// However, if a line is meant to be removed, replacement will contain
	// '<tourbot-rm-blank>'. This is unconditionally removed.
	// If a line is empty as a consequence of this, the line will be nulled.
	if (str.indexOf('<tourbot-rm-blank>') !== -1) {
		str = str.replace('<tourbot-rm-blank>', '');
		if (str === '') {
			str = null;
		}
	}
	return str;
}

module.exports = function replace(str, pattern, siteinfo) {
	return fixupReplacement(
		str.replace(
			expandPattern(pattern.regex, siteinfo),
			pattern.replacement
		)
	);
};
