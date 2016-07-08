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
