/* eslint-env qunit */

const Content = require('../src/content');

let passCases = [{
  name: 'Valid CSS on a CSS page',
  pageName: 'foo.css',
  content: '.foo {}'
},
{
  // CSS page content is not currently validated
  name: 'Unexpected JS on a CSS page',
  pageName: 'foo.css',
  content: 'foo();'
},
{
  name: 'CSS page with balanced <nowiki>',
  pageName: 'foo.css',
  content: '// <nowiki>\n.foo {}\n// </nowiki>'
},
{
  name: 'Valid JS on a JS page',
  pageName: 'foo.js',
  content: 'foo();'
},
{
  name: 'JS page with balanced <nowiki>',
  pageName: 'foo.js',
  content: '// <nowiki>\nfoo();\n// </nowiki>'
}];
let failCases = [{
  name: 'Unexpected CSS on a JS page',
  pageName: 'foo.js',
  content: '.foo {}'
},
{
  name: 'CSS page with unclosed <nowiki>',
  pageName: 'foo.css',
  content: '// <nowiki>\n.foo {}'
},
{
  name: 'JS page with unclosed <nowiki>',
  pageName: 'foo.js',
  content: '// <nowiki>\nfoo();'
}];

QUnit.module('content');

for (let data of passCases) {
  QUnit.test(data.name, async (assert) => {
    assert.expect(0);

    await Content.checkSubject(
      { pageName: data.pageName },
      data.content,
      // Disable interactive 'ask'
      { quiet: true }
    );
  });
}
for (let data of failCases) {
  QUnit.test(data.name, async (assert) => {
    assert.rejects(Content.checkSubject(
      { pageName: data.pageName },
      data.content,
      // Disable interactive 'ask'
      { quiet: true }
    ));
  });
}
