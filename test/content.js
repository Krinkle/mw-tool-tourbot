/* eslint-env qunit */

const Content = require('../src/content');

QUnit.module('content');

QUnit.test.each('Pass', {
  'valid CSS': {
    pageName: 'foo.css',
    content: '.foo {}'
  },
  'JS on a CSS page': {
    // CSS page content is not currently validated
    pageName: 'foo.css',
    content: 'foo();'
  },
  'CSS with balanced nowiki': {
    pageName: 'foo.css',
    content: '// <nowiki>\n.foo {}\n// </nowiki>'
  },
  'valid JS': {
    pageName: 'foo.js',
    content: 'foo();'
  },
  'JS with balanced nowiki': {
    pageName: 'foo.js',
    content: '// <nowiki>\nfoo();\n// </nowiki>'
  }
}, async (assert, data) => {
  assert.expect(0);

  await Content.checkSubject(
    { pageName: data.pageName },
    data.content,
    // Disable interactive 'ask'
    { quiet: true }
  );
});

QUnit.test.each('Fail', {
  'CSS on a JS page': {
    pageName: 'foo.js',
    content: '.foo {}'
  },
  'CSS with unclosed nowiki': {
    pageName: 'foo.css',
    content: '// <nowiki>\n.foo {}'
  },
  'JS with unclosed nowiki': {
    pageName: 'foo.js',
    content: '// <nowiki>\nfoo();'
  }
}, async (assert, data) => {
  assert.rejects(Content.checkSubject(
    { pageName: data.pageName },
    data.content,
    // Disable interactive 'ask'
    { quiet: true }
  ));
});
