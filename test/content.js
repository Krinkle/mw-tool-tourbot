var assert = require('assert-diff');

var Content = require('../src/content');

async function assertPromise (actual, expected, message) {
  try {
    await actual;
  } catch (err) {
    assert.strictEqual('rejected', expected, message);
    return;
  }

  assert.strictEqual('resolved', expected, message);
}

function testcase (title, content) {
  return Content.checkSubject(
    { pageName: title },
    content,
    // Disable interactive 'ask'
    { quiet: true }
  );
}

module.exports = async function testContent () {
  await assertPromise(
    testcase('foo.css', '.foo {}'),
    'resolved',
    'Valid CSS on a CSS page'
  );
  await assertPromise(
    testcase('foo.css', 'foo();'),
    // CSS is not currently validated
    'resolved',
    'Valid JS on a CSS page'
  );
  await assertPromise(
    testcase('foo.css', '// <nowiki>\n.foo {}\n// </nowiki>'),
    'resolved',
    'Valid CSS on a CSS page with balanced <nowiki>'
  );
  await assertPromise(
    testcase('foo.css', '// <nowiki>\n.foo {}'),
    'rejected',
    'Valid CSS on a CSS page with unclosed <nowiki>'
  );

  await assertPromise(
    testcase('foo.js', '.foo {}'),
    'rejected',
    'CSS on a JS page'
  );
  await assertPromise(
    testcase('foo.js', 'foo();'),
    'resolved',
    'Valid JS on a JS page'
  );
  await assertPromise(
    testcase('foo.js', '// <nowiki>\nfoo();\n// </nowiki>'),
    'resolved',
    'Valid JS on a JS page with balanced <nowiki>'
  );
  await assertPromise(
    testcase('foo.js', '// <nowiki>\nfoo();'),
    'rejected',
    'Valid JS on a JS page with unclosed <nowiki>'
  );
};
