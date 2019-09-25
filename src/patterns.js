module.exports = [
  // Migration
  {
    // Match 'addOnloadHook' - Ignore e.g. 'DatRoot.addOnloadHook'
    regex: /^((?!.*function addOnloadHook\s*\().*)([^.]|^)(?!\.)(?:window\.)?addOnloadHook\s*\(/,
    replacement: '$1$2$(',
    summary: 'addOnloadHook is deprecated'
  },
  {
    // Match 'escapeQuotes' and 'window.escapeQuotes' - Ignore e.g. 'pg.escapeQuotes'
    regex: /([^.]|^)(?!\.)(?:window\.)?escapeQuotesHTML\s*\(/,
    replacement: '$1mw.html.escape(',
    summary: 'escapeQuotesHTML is deprecated'
  },
  {
    regex: /mw\.util\.wikiGetlink\s*\(/,
    replacement: 'mw.util.getUrl(',
    summary: 'mw.util.wikiGetlink is deprecated'
  },
  {
    regex: /([^.]|^)(?!\.)(?:window\.)?escapeQuotes\s*\(/,
    replacement: 'mw.html.escape(',
    summary: 'escapeQuotes is deprecated'
  },
  {
    regex: /(?:\$|\$j|jQuery)\.trimLeft\s*\(\s*([^\n()]+?)\s*\)/,
    replacement: '$1.replace(/^\\s+/, \'\')',
    summary: '$.trimLeft is deprecated'
  },
  {
    regex: /(?:\$|\$j|jQuery)\.trimRight\s*\(\s*([^\n()]+?)\s*\)/,
    replacement: '$1.replace(/\\s+$/, \'\')',
    summary: '$.trimRight is deprecated'
  },
  {
    regex: /\bimportScriptURI\s*\(/,
    replacement: 'mw.loader.load(',
    summary: 'importScriptURI is deprecated'
  },
  {
    regex: /\bimportStylesheetURI\s*\(\s*([^\n)]+?)\s*\)/,
    replacement: 'mw.loader.load($1, \'text/css\')',
    summary: 'importStylesheetURI is deprecated'
  },
  {
    regex: /\bmw\s*\.\s*config\s*\.\s*values\s*\.\s*(\w+)/,
    replacement: 'mw.config.get(\'$1\')',
    summary: 'mw.config.values is deprecated'
  },
  {
    regex: /\bmw\s*\.\s*user\s*\.\s*(options|tokens)\s*\.\s*values\s*\.\s*(\w+)/,
    replacement: 'mw.user.$1.get(\'$2\')',
    summary: 'Map.values is deprecated'
  },
  {
    // Patch for HotCat's use of the entire values object
    regex: /(\?\s*)mw\.(config|user\.tokens|user\.options)\.values(\s*:)/,
    replacement: '$1mw.$2.get()$3',
    summary: 'Map.values is deprecated'
  },
  {
    // Patch for Wikimedia Commons's use of the entire values object
    regex: /(\()mw\.(config|user\.tokens|user\.options)\.values(\s*[,)])/,
    replacement: '$1mw.$2.get()$3',
    summary: 'Map.values is deprecated'
  },
  {
    regex: /(?:wgPageName|wgTitle)\s*(!)?===?\s*['"]<siteinfo-mainpage>['"]\s*&&\s*wgNamespaceNumber\s*===?\s*\d+/,
    replacement: '$1mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /mw\.config\.get\(['"](?:wgPageName|wgTitle)['"]\)\s*(!)?===?\s*['"]<siteinfo-mainpage>['"]\s*&&\s*mw\.config\.get\(['"]wgNamespaceNumber['"]\)\s*===?\s*\d+/,
    replacement: '$1mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /(?:wgPageName|wgTitle)\s*(!)?===?\s*['"]<siteinfo-mainpagename>['"]/,
    replacement: '$1mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /mw\.config\.get\(['"](?:wgPageName|wgTitle)['"]\)\s*(!)?===?\s*['"]<siteinfo-mainpagename>['"]/,
    replacement: '$1mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /mw\.config\.get\(['"](?:wgPageName|wgTitle)['"]\)\s*(!)?===?\s*mw\.config\.get\(['"]wgMainPageTitle['"]\)/,
    replacement: '$1mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /mw\.config\.get\(['"]wgMainPageTitle['"]\)\s*(!)?===?\s*mw\.config\.get\(['"](?:wgPageName|wgTitle)['"]\)/,
    replacement: '$1mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /(?:wgPageName|wgTitle)\s*(!)?===?\s*wgMainPageTitle/,
    replacement: '$1mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /wgMainPageTitle\s*(!)?===?\s*(?:wgPageName|wgTitle)/,
    replacement: '$1mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    // Embed between single-quoted strings
    regex: /'(\s*\+\s*)wgScriptExtension(\s*\+\s*)'/,
    replacement: '.php',
    summary: 'wgScriptExtension is deprecated'
  },
  {
    // Embed between double-quoted strings
    regex: /"(\s*\+\s*)wgScriptExtension(\s*\+\s*)"/,
    replacement: '.php',
    summary: 'wgScriptExtension is deprecated'
  },
  {
    // Embed after any string as last part of a statement
    regex: /(["'])(\s*\+\s*)wgScriptExtension(\s*[;,]|$)/,
    replacement: '.php$1$3',
    summary: 'wgScriptExtension is deprecated'
  },
  {
    // Fallback
    regex: /(['"=+]\s+)wgScriptExtension(\s+)/,
    replacement: '$1\'.php\'$2',
    summary: 'wgScriptExtension is deprecated'
  },
  {
    regex: /(https?:)?\/\/toolserver\.org\/~kolossos\/openlayers\/kml-on-ol\.php/,
    replacement: 'https://tools.wmflabs.org/wiwosm/osm-on-ol/kml-on-ol.php',
    summary: 'Update old toolserver url'
  },
  {
    regex: /(https?:)?\/\/(toolserver\.org|tools\.wikimedia\.de)\/~daniel\/WikiSense\/Contributors.php\/?/,
    replacement: 'https://tools.wmflabs.org/xtools-articleinfo/',
    summary: 'Update old toolserver url'
  },
  {
    regex: /(https?:)?\/\/(toolserver\.org|tools\.wikimedia\.de)\/~luxo\/contributions\/contributions.php\/?/,
    replacement: 'https://tools.wmflabs.org/guc/',
    summary: 'Update old toolserver url'
  },
  {
    regex: /(https?:)?\/\/(toolserver\.org|tools\.wikimedia\.de)\/~magnus\/fist.php/,
    replacement: 'https://tools.wmflabs.org/fist/fist.php',
    summary: 'Update old toolserver url'
  },
  {
    // A common pattern on pages like MediaWiki:Gadget-UseLangEn.js
    regex: /,\s*wgServer \+ wgScript \+ '\?title=' \+ encodeURIComponent\(wgPageName\) \+ '&uselang=([a-zA-Z-]+)'/,
    replacement: ', mw.util.getUrl(null, { uselang: \'$1\' })',
    summary: 'Use mw.util.getUrl'
  },
  {
    regex: /,\s*wgServer\s*\+\s*wgScript\s*\+\s*'\?title='\s*\+\s*encodeURIComponent\(\s*wgPageName\s*\)\s*\+\s*'&action=purge'/,
    replacement: ', mw.util.getUrl(null, { action: \'purge\' })',
    summary: 'Use mw.util.getUrl'
  },
  // bits.wikimedia.org is deprecated – https://phabricator.wikimedia.org/T107430
  {
    regex: /(https?:)?\/\/bits\.wikimedia\.org\/static[-/]current\//,
    replacement: '/static/current/',
    summary: 'bits.wikimedia.org'
  },
  {
    regex: /(https?:)?\/\/bits\.wikimedia\.org\/skins\//,
    replacement: '/w/skins/',
    summary: 'bits.wikimedia.org'
  },
  {
    regex: /(https?:)?\/\/bits\.wikimedia\.org\/skins-1\.5\//,
    replacement: '/w/skins/',
    summary: 'bits.wikimedia.org'
  },
  {
    regex: /((https?:)?\/\/[a-z.]+\.org)\/skins-1\.5\//,
    replacement: '$1/w/skins/',
    summary: 'skins-1.5 is deprecated'
  },
  {
    regex: /(url\(['"]?)\/skins-1\.5\//,
    replacement: '$1/w/skins/',
    summary: 'skins-1.5 is deprecated'
  },
  {
    regex: /(https?:)?\/\/bits\.wikimedia\.org\/static-([^/]+)\/(skins|extensions|resources)\//,
    replacement: '/w/$3/',
    summary: 'bits.wikimedia.org'
  },
  {
    // Popular typo "commons/wikibits.js" on various French-language wikis.
    regex: /\/?w?\/skins-1\.5\/commons\/(wikibits\.js|edit\.js)/,
    replacement: '/w/skins/common/$1',
    summary: 'skins-1.5 is deprecated'
  },
  {
    regex: /\/?w?\/skins-1\.5\/(common|monobook)\/(wikibits\.js|edit\.js|main\.css)/,
    replacement: '/w/skins/$1/$2',
    summary: 'skins-1.5 is deprecated'
  },
  {
    regex: /((https?:)?\/\/)bits\.wikimedia\.org\/([^/]+)\/load\.php/,
    replacement: 'https://$3/w/load.php',
    summary: 'bits.wikimedia.org'
  },
  {
    regex: /(https?:)?\/\/sv\.wikipedia\.org\/w\/index\.php\?.+MediaWiki:Gadget-Wdsearch\.js[^'";]+/,
    replacement: '//en.wikipedia.org/w/index.php?title=MediaWiki:Wdsearch.js&action=raw&ctype=text/javascript',
    summary: 'Load Wdsearch.js from en.wikipedia.org (canonical+secure version)'
  },
  {
    regex: /^\s+\w+\.document\.write\(['"]<style[^>]+>.+\[CDATA\[.+@import.+\/skins-1\.5.*monobook.*main\.css[^<]+<\\?\/style>['"]\);/,
    replacement: '<tourbot-rm-blank>',
    summary: 'Remove broken popop import'
  },
  {
    //
    //   popup.document.write('<script type="text\/javascript" src="\/skins-1.5\/common\/wikibits.js"><!-- wikibits js --><\/script>');
    regex: /^\s+\w+\.document\.write\(['"]<script[^>]* src=['"][^'"]*\/skins-1\.5.*common.*wikibits\.js['"]?>(<!--\s*[^-]+\s*-->)?<\\?\/script>['"]\);/,
    replacement: '<tourbot-rm-blank>',
    summary: 'Remove broken popop import'
  },
  {
    regex: /\.\s*size\s*\(\s*\)/,
    replacement: '.length',
    summary: 'Replace jQuery#size ([[phab:T169385|deprecated]])'
  },
  {
    regex: /\.\s*andSelf\s*\(\s*\)/,
    replacement: '.addBack()',
    summary: 'Replace jQuery#andSelf ([[phab:T169385|deprecated]])'
  },
  {
    regex: /removeAttr\(\s*['"](checked|selected|disabled|readonly|required|hidden)['"]/,
    replacement: 'prop(\'$1\', false',
    summary: 'Replace jQuery#removeAttr ([[phab:T169385|deprecated]])'
  },
  {
    regex: /attr\(\s*['"](checked|selected|disabled|readonly|required|hidden)['"], (true|['"](checked|selected|disabled|readonly|required|hidden)['"])/,
    replacement: 'prop(\'$1\', true'
  },
  {
    regex: /^\s*if\s*\(\s*!Object\.keys\s*\)\s*dep(endencies)?\.push\(\s*['"](?:es5-shim|json|dom-level2-shim)['"]\s*\);?/,
    replacement: '<tourbot-rm-blank>',
    summary: 'Removed redundant module'
  },
  {
    // First item: foo[dependencies=X, z]
    regex: /(dependencies=\s*)(?:es5-shim|json|dom-level2-shim)\s*,\s*/,
    replacement: '$1<tourbot-rm-blank>',
    summary: 'Removed obsolete module'
  },
  {
    // Middle item: foo[dependencies=y, X, z]
    regex: /(,\s*)(?:es5-shim|json|dom-level2-shim)\s*,\s*/,
    replacement: '$1',
    summary: 'Removed obsolete module'
  },
  {
    // Last item: foo[dependencies=y, z, X]
    regex: /(,\s*)(?:es5-shim|json|dom-level2-shim)(\s*[|\]])/,
    replacement: '$2',
    summary: 'Removed obsolete module'
  },
  {
    // Sole param (no callback): using('X') or load('X')
    regex: /(mw\.loader\.|^\s*)(?:load|using)\s*\(\s*['"](?:es5-shim|json|dom-level2-shim)['"]\s*\)\s*;?\s*/,
    replacement: '<tourbot-rm-blank>',
    summary: 'Removed obsolete module'
  },
  {
    // First item: ['X', z]
    regex: /(\[)\s*['"](?:es5-shim|json|dom-level2-shim)['"]\s*,?/,
    replacement: '$1',
    summary: 'Removed obsolete module'
  },
  {
    // Middle item: [y, 'X', z]
    regex: /(\[.+,\s*)['"](?:es5-shim|json|dom-level2-shim)['"]\s*,\s*/,
    replacement: '$1',
    summary: 'Removed obsolete module'
  },
  {
    // Last item: [y, z, 'X']
    regex: /(,\s*)['"](?:es5-shim|json|dom-level2-shim)['"](\s*\])/,
    replacement: '$2',
    summary: 'Removed obsolete module'
  },
  {
    // Middle item: foo[dependencies=z, X z]
    // Last item: foo[dependencies=z, X]
    regex: /(\[[^\]]*dependencies=[^\]]*),\s*mediawiki\.legacy\.wikibits\s*\b/,
    replacement: '$1',
    summary: 'Removed redundant module'
  },
  {
    // Only item: foo[dependencies=X]
    // (This regex must be handled before the below one for "First item")
    regex: /(\[[^\]]*?)\|?\bdependencies=\s*mediawiki\.legacy\.wikibits\s*(\]|\|)/,
    replacement: '$1$2',
    summary: 'Removed redundant module'
  },
  {
    // First item: foo[dependencies=X, z]
    regex: /(\[[^\]]*dependencies=\s*)mediawiki\.legacy\.wikibits\s*,/,
    replacement: '$1',
    summary: 'Removed redundant module'
  },
  {
    // Remove old alias when destination is already present before it
    regex: /(mw\.loader\.(?:using|load)\(\s*[^\])]*['"]mediawiki\.api['"][^\])]*)\s*,\s*['"]mediawiki\.api\.(?:category|edit|login|options|parse|upload|user|watch|messages|rollback)['"]/,
    replacement: '$1',
    summary: 'Updated deprecated module name'
  },
  {
    regex: /(['"]|[,=]\s*)(?:jquery\.wikiEditor|jquery\.wikiEditor\.core|jquery\.wikiEditor\.toolbar|ext\.wikiEditor\.toolbar)(['"]|\s*[,|\]])/,
    replacement: '$1ext.wikiEditor$2',
    summary: 'Updated deprecated module name'
  },
  {
    regex: /(['"]|[,=]\s*)jquery\.byteLimit(['"]|\s*[,|\]])/,
    replacement: '$1jquery.lengthLimit$2',
    summary: 'Updated deprecated module name'
  },
  {
    // Superseded module in previous array element
    regex: /(['"]mediawiki\.util['"]\s*),\s*['"](?:jquery\.accessKeyLabel|mediawiki\.RegExp)['"]/,
    replacement: '$1',
    summary: 'Updated deprecated module name'
  },
  {
    // Superseded module in next array element
    regex: /['"](?:jquery\.accessKeyLabel|mediawiki\.RegExp)['"]\s*,\s*(['"]mediawiki\.util['"]\s*)/,
    replacement: '$1',
    summary: 'Updated deprecated module name'
  },
  {
    // Superseded module in gadget definition
    regex: /\bmediawiki\.util\s*,\s*(?:jquery\.accessKeyLabel|mediawiki\.RegExp)\b|\b(?:jquery\.accessKeyLabel|mediawiki\.RegExp)\b\s*,\s*mediawiki\.util\b/,
    replacement: 'mediawiki.util',
    summary: 'Updated deprecated module name'
  },
  {
    regex: /(['"]|[,=]\s*)(?:jquery\.accessKeyLabel|mediawiki\.RegExp)(['"]|\s*[,|\]])/,
    replacement: '$1mediawiki.util$2',
    summary: 'Updated deprecated module name'
  },
  {
    // Replace old alias with destination
    regex: /(['"]|[,=]\s*)mediawiki\.api\.(?:category|edit|login|options|parse|upload|user|watch|messages|rollback)(['"]|\s*[,|\]])/,
    replacement: '$1mediawiki.api$2',
    summary: 'Updated deprecated module name'
  },
  {
    regex: /(mw\s*\.\s*user\s*\.\s*tokens\s*\.\s*get\s*\(\s*)(?:(')editToken(')|(")editToken("))(\s*\))/,
    replacement: '$1$2$4csrfToken$3$5$6',
    summary: 'Updated deprecated user.tokens key'
  },
  {
    regex: /[?&]s?maxage=\d*/,
    replacement: '',
    summary: 'Remove unused "maxage" to improve cache performance'
  },
  // Clean-up (not worth an edit of itself)
  {
    regex: /(@import\s+url\(['"])\/\/([a-z.]+\.org)/,
    replacement: '$1https://$2'
  },
  {
    regex: /[?&]dontcountme=s/,
    replacement: ''
  },
  {
    regex: /[?&]bcache=\d+/,
    replacement: ''
  },
  {
    // Strip old wgStyleVersion.
    // No longer needed with wmfstatic cache-control
    regex: /(\/(skins|extensions|resources)\/[^?]+)\?30\d-\d\d?\b/,
    replacement: '$1'
  },
  {
    regex: /\.org\/(\?title=.*&action=raw&ctype=)/,
    replacement: '.org/w/index.php$1'
  },
  {
    regex: /\$j\s*(\(|\.)/,
    replacement: '$$$1'
  },
  {
    regex: /\s*\.\s*charAt\(\s*0\s*\)/,
    replacement: '[0]'
  },
  {
    // These urls were already broken by vector>Vector, but let's be nice.
    regex: /\/w\/skins\/vector\//,
    replacement: '/w/skins/Vector/'
  },
  {
    // These urls were already broken by vector>Vector, but let's be nice.
    regex: /\/w\/skins\/monobook\//,
    replacement: '/w/skins/MonoBook/'
  },
  // Fixes for mw.user methods that were both deprecated and
  // removed long before we started fixing them. Given scripts
  // with these in them are likely broken, they should not get
  // their own edit.
  {
    regex: /mw\.user\.name\s*\(/,
    replacement: 'mw.user.getName('
  },
  {
    regex: /mw\.user\.anonymous\s*\(/,
    replacement: 'mw.user.isAnon('
  }
];
