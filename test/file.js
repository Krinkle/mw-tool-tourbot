/* eslint-env qunit */

const file = require('../src/file.js');

QUnit.module('file');

QUnit.test('mwgrep output', (assert) => {
  const output = file.parseResults(`
frwiki              User:Appaches/common.js
metawiki            User:Jeph paul/formsGadget.js
rowiki              User:Anneto/user.css
sourceswiki         User:Koavf/monobook.js
testwiki            User:TheDJ/text.js
  `);
  assert.deepEqual(
    [
      {
        wiki: 'frwiki',
        pageName: 'User:Appaches/common.js'
      },
      {
        wiki: 'metawiki',
        pageName: 'User:Jeph paul/formsGadget.js'
      },
      {
        wiki: 'rowiki',
        pageName: 'User:Anneto/user.css'
      },
      {
        wiki: 'sourceswiki',
        pageName: 'User:Koavf/monobook.js'
      },
      {
        wiki: 'testwiki',
        pageName: 'User:TheDJ/text.js'
      }
    ],
    output,
    'parsed result'
  );
});

QUnit.test('global-search JSON', (assert) => {
  const output = file.parseResults(`
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
  `);
  assert.deepEqual(
    [
      {
        wiki: 'et.wikipedia.org',
        pageName: 'Vikipeedia:Tööriistad/Muudatuste tühistaja/kood.js'
      },
      {
        wiki: 'test.wikipedia.org',
        pageName: 'MediaWiki:Gadget-GallerySlideshow.js'
      },
      {
        wiki: 'www.mediawiki.org',
        pageName: '  User:Slaporte (WMF)/common.js'
      }
    ],
    output,
    'parsed result'
  );
});
