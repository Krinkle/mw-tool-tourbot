module.exports = [
  // Migration
  {
    // Match 'addOnloadHook' - Ignore e.g. 'DatRoot.addOnloadHook'
    regex: /^((?!.*function addOnloadHook\s*\().*)([^.]|^)(?!\.)(?:window\.)?addOnloadHook\s*\(/g,
    replacement: '$1$2$(',
    summary: 'addOnloadHook is deprecated'
  },
  {
    // Match 'escapeQuotes' and 'window.escapeQuotes' - Ignore e.g. 'pg.escapeQuotes'
    regex: /([^.]|^)(?!\.)(?:window\.)?escapeQuotesHTML\s*\(/g,
    replacement: '$1mw.html.escape(',
    summary: 'escapeQuotesHTML is deprecated'
  },
  {
    regex: /mw\.util\.wikiGetlink\s*\(/g,
    replacement: 'mw.util.getUrl(',
    summary: 'mw.util.wikiGetlink is deprecated'
  },
  {
    regex: /([^.]|^)(?!\.)(?:window\.)?escapeQuotes\s*\(/g,
    replacement: 'mw.html.escape(',
    summary: 'escapeQuotes is deprecated'
  },
  {
    regex: /(?:\$|\$j|jQuery)\.trimLeft\s*\(\s*([^\n()]+?)\s*\)/g,
    replacement: '$1.replace(/^\\s+/, \'\')',
    summary: '$.trimLeft is deprecated'
  },
  {
    regex: /(?:\$|\$j|jQuery)\.trimRight\s*\(\s*([^\n()]+?)\s*\)/g,
    replacement: '$1.replace(/\\s+$/, \'\')',
    summary: '$.trimRight is deprecated'
  },
  {
    regex: /\bimportScriptURI\s*\(/g,
    replacement: 'mw.loader.load(',
    summary: 'importScriptURI is deprecated'
  },
  {
    regex: /\bimportStylesheetURI\s*\(\s*([^\n)]+?)\s*\)/g,
    replacement: 'mw.loader.load($1, \'text/css\')',
    summary: 'importStylesheetURI is deprecated'
  },
  {
    regex: /\bmw\s*\.\s*config\s*\.\s*values\s*\.\s*(\w+)/g,
    replacement: 'mw.config.get(\'$1\')',
    summary: 'mw.config.values is deprecated'
  },
  {
    regex: /\bmw\s*\.\s*user\s*\.\s*(options|tokens)\s*\.\s*values\s*\.\s*(\w+)/g,
    replacement: 'mw.user.$1.get(\'$2\')',
    summary: 'Map.values is deprecated'
  },
  {
    // Patch for HotCat's use of the entire values object
    regex: /(\?\s*)mw\.(config|user\.tokens|user\.options)\.values(\s*:)/g,
    replacement: '$1mw.$2.get()$3',
    summary: 'Map.values is deprecated'
  },
  {
    // Patch for Wikimedia Commons's use of the entire values object
    regex: /(\()mw\.(config|user\.tokens|user\.options)\.values(\s*[,)])/g,
    replacement: '$1mw.$2.get()$3',
    summary: 'Map.values is deprecated'
  },
  {
    regex: /wgTitle\s*===?\s*['"]<siteinfo-mainpage>['"]\s*&&\s*wgNamespaceNumber\s*===?\s*\d+/g,
    replacement: 'mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /mw\.config\.get\(['"]wgTitle['"]\)\s*===?\s*['"]<siteinfo-mainpage>['"]\s*&&\s*mw\.config\.get\(['"]wgNamespaceNumber['"]\)\s*===?\s*\d+/g,
    replacement: 'mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /wgPageName\s*===?\s*['"]<siteinfo-mainpagename>['"]/g,
    replacement: 'mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
  },
  {
    regex: /mw\.config\.get\(['"]wgPageName['"]\)\s*===?\s*['"]<siteinfo-mainpagename>['"]/g,
    replacement: 'mw.config.get(\'wgIsMainPage\')',
    summary: 'Use wgIsMainPage'
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
    regex: /,\s*wgServer \+ wgScript \+ '\?title=' \+ encodeURIComponent\(wgPageName\) \+ '&uselang=([a-zA-Z-]+)'/g,
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
    regex: /(https?:)?\/\/bits\.wikimedia\.org\/static[-/]current\//g,
    replacement: '/static/current/',
    summary: 'bits.wikimedia.org'
  },
  {
    regex: /(https?:)?\/\/bits\.wikimedia\.org\/skins\//g,
    replacement: '/w/skins/',
    summary: 'bits.wikimedia.org'
  },
  {
    regex: /(https?:)?\/\/bits\.wikimedia\.org\/skins-1\.5\//g,
    replacement: '/w/skins/',
    summary: 'bits.wikimedia.org'
  },
  {
    regex: /((https?:)?\/\/[a-z.]+\.org)\/skins-1\.5\//g,
    replacement: '$1/w/skins/',
    summary: 'skins-1.5 is deprecated'
  },
  {
    regex: /(url\(['"]?)\/skins-1\.5\//g,
    replacement: '$1/w/skins/',
    summary: 'skins-1.5 is deprecated'
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
  {
    regex: /(https?:)?\/\/sv\.wikipedia\.org\/w\/index\.php\?.+MediaWiki:Gadget-Wdsearch\.js[^'";]+/,
    replacement: '//en.wikipedia.org/w/index.php?title=MediaWiki:Wdsearch.js&action=raw&ctype=text/javascript',
    summary: 'Load Wdsearch.js from en.wikipedia.org (canonical+secure version)'
  },
  {
    //
    //  popup.document.write('<style type=\"text\/css\" media=\"screen,projection\">/*<![CDATA[*/ @import "\/skins-1.5\/monobook\/main.css?5\";@import \"/skins-1.5/monobook/rtl.css\"; /*]]>*/<\/style>');
    regex: /^\s+\w+\.document\.write\(['"]<style[^>]+>.+\[CDATA\[.+@import.+\/skins-1\.5.*monobook.*main\.css[^<]+<\\?\/style>['"]\);/g,
    replacement: '<tourbot-rm-blank>',
    summary: 'Remove broken popup CSS'
  },
  {
    regex: /removeAttr\(\s*['"](checked|selected|disabled|readonly|required|hidden)['"]/,
    replacement: 'prop(\'$1\', false',
    summary: 'Replace deprecated types of removeAttr calls [[phab:T169385]]'
  },
  {
    regex: /attr\(\s*['"](checked|selected|disabled|readonly|required|hidden)['"], (true|['"](checked|selected|disabled|readonly|required|hidden)['"])/,
    replacement: 'prop(\'$1\', true'
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
    // Strip old wgStyleVersion.
    // No longer needed with wmfstatic cache-control
    regex: /(\/(skins|extensions|resources)\/[^?]+)\?30\d-\d\d?\b/g,
    replacement: '$1'
  },
  {
    regex: /\.org\/(\?title=.*&action=raw&ctype=)/g,
    replacement: '.org/w/index.php$1'
  },
  {
    regex: /\.org\/w\/index\.php\?action=raw&ctype=text\/(css|javascript)&title=([^'";]+)/g,
    replacement: '.org/w/index.php?title=$2&action=raw&ctype=text/$1'
  },
  {
    regex: /\$j\s*(\(|\.)/g,
    replacement: '$$$1'
  },
  {
    regex: /\s*\.\s*charAt\(\s*0\s*\)/,
    replacement: '[0]'
  },
  {
    // These urls were already broken by vector>Vector, but let's be nice.
    regex: /\/w\/skins\/vector\//g,
    replacement: '/w/skins/Vector/'
  },
  {
    // These urls were already broken by vector>Vector, but let's be nice.
    regex: /\/w\/skins\/monobook\//g,
    replacement: '/w/skins/MonoBook/'
  }
];
