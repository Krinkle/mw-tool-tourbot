var assert = require('assert-diff');
var file = require('../src/file.js');

module.exports = function testFile (progress) {
  const testCases = {
    'mwgrep output': {
      input: `
frwiki              User:Appaches/common.js
metawiki            User:Jeph paul/formsGadget.js
rowiki              User:Anneto/user.css
sourceswiki         User:Koavf/monobook.js
testwiki            User:TheDJ/text.js
`,
      expected: [
        {
          wikiId: 'frwiki',
          pageName: 'User:Appaches/common.js'
        },
        {
          wikiId: 'metawiki',
          pageName: 'User:Jeph paul/formsGadget.js'
        },
        {
          wikiId: 'rowiki',
          pageName: 'User:Anneto/user.css'
        },
        {
          wikiId: 'sourceswiki',
          pageName: 'User:Koavf/monobook.js'
        },
        {
          wikiId: 'testwiki',
          pageName: 'User:TheDJ/text.js'
        }
      ]
    },
    'global-search JSON': {
      input: `
{
  "q": "some\\\\.regexp",
  "regex": true,
  "hits": [
    {
      "wiki": "et.wikipedia",
      "title": "Vikipeedia:Tööriistad/Muudatuste tühistaja/kood.js"
    },
    {
      "wiki": "test.wikipedia",
      "title": "MediaWiki:Gadget-GallerySlideshow.js"
    },
    {
      "wiki": "www.mediawiki",
      "title": "  User:Slaporte (WMF)/common.js"
    }
  ]
}
      `,
      expected: [
        {
          wikiId: 'etwiki',
          pageName: 'Vikipeedia:Tööriistad/Muudatuste tühistaja/kood.js'
        },
        {
          wikiId: 'testwiki',
          pageName: 'MediaWiki:Gadget-GallerySlideshow.js'
        },
        {
          wikiId: 'wwwmediawiki',
          pageName: '  User:Slaporte (WMF)/common.js'
        }
      ]
    }
  };
  for (const label in testCases) {
    progress();
    const output = file.parseResults(testCases[label].input);
    assert.deepEqual(
      testCases[label].expected,
      output,
      `parsed result ${label}`
    );
  }
};
