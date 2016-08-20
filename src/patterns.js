module.exports = [
	// Migration
	{
		regex: /^((?!.*function addOnloadHook\s*\().*)addOnloadHook\s*\(/g,
		replacement: '$1$(',
		summary: 'addOnloadHook is deprecated'
	},
	{
		regex: /(?:window\.)?escapeQuotesHTML\s*\(/g,
		replacement: 'mw.html.escape(',
		summary: 'escapeQuotesHTML is deprecated'
	},
	{
		regex: /mw\.util\.wikiGetlink\s*\(/g,
		replacement: 'mw.util.getUrl(',
		summary: 'mw.util.wikiGetlink is deprecated'
	},
	{
		regex: /(?:window\.)?escapeQuotes\s*\(/g,
		replacement: 'mw.html.escape(',
		summary: 'escapeQuotes is deprecated'
	},
	{
		regex: /\bimportScriptURI\s*\(/g,
		replacement: 'mw.loader.load(',
		summary: 'importScriptURI is deprecated'
	},
	{
		regex: /\bimportStylesheetURI\s*\(\s*([^\n\)]+?)\s*\)/g,
		replacement: 'mw.loader.load($1, \'text/css\')',
		summary: 'importStylesheetURI is deprecated'
	},
	{
		regex: /(https?:)?\/\/toolserver\.org\/~kolossos\/openlayers\/kml\-on\-ol\.php/,
		replacement: 'https://tools.wmflabs.org/wiwosm/osm-on-ol/kml-on-ol.php',
		summary: 'Update old toolserver url'
	},
	// bits.wikimedia.org is deprecated – https://phabricator.wikimedia.org/T107430
	{
		regex: /(https?:)?\/\/bits\.wikimedia\.org\/skins\//g,
		replacement: '/static/current/skins/',
		summary: 'bits.wikimedia.org'
	},
	{
		regex: /(https?:)?\/\/bits\.wikimedia\.org\/static-current\//g,
		replacement: '/static/current/',
		summary: 'bits.wikimedia.org'
	},
	{
		// These urls were already broken by vector>Vector, but let's be nice.
		regex: /(https?:)?\/\/bits\.wikimedia\.org\/static-([^/]+)\/skins\/vector\//g,
		replacement: '/w/skins/Vector/',
		summary: 'bits.wikimedia.org'
	},
	{
		regex: /(https?:)?\/\/bits\.wikimedia\.org\/static-([^/]+)\/(skins|extensions|resources)\//g,
		replacement: '/w/$3/',
		summary: 'bits.wikimedia.org'
	},
	{
		regex: /((https?:)?\/\/)bits\.wikimedia\.org\/([^/]+)\/load\.php/g,
		replacement: 'https://$3/w/load.php',
		summary: 'bits.wikimedia.org'
	},
	// Clean-up (not worth an edit of itself)
	{
		regex: /[?&]s?maxage=\d*/g,
		replacement: ''
	},
	{
		regex: /[?&]dontcountme=s/g,
		replacement: ''
	},
	{
		regex: /\.org\/(\?title=.*&action=raw&ctype=)/g,
		replacement: '.org/w/index.php$1'
	},
	{
		regex: /\$j\s*(\(|\.)/g,
		replacement: '$$$1'
	}
];
