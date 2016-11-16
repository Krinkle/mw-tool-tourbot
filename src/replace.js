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

module.exports = function replace(str, pattern, siteinfo) {
	return str.replace(expandPattern(pattern.regex, siteinfo), pattern.replacement);
};
