var assert = require('assert-diff');
var fs = require('fs');
var path = require('path');

var Content = require('../src/content');
var patterns = require('../src/patterns');
var replace = require('../src/replace');

function assertPromise (actual, expected, message) {
  return actual.then(function () {
    assert.strictEqual('resolved', expected, message);
  }, function () {
    assert.strictEqual('rejected', expected, message);
  });
}

function testReplacement () {
  function applyPatterns (lines) {
    var output = lines.slice();
    patterns.forEach(function (pattern) {
      output.forEach(function (line, i) {
        if (line !== null) {
          output[i] = replace(line, pattern, siteinfo);
        }
      });
    });
    output = output.filter(function (line) {
      return line !== null;
    });
    return output;
  }

  var input = fs.readFileSync(path.join(__dirname, 'testcase.txt')).toString();
  var expected = fs.readFileSync(path.join(__dirname, 'expected.txt')).toString();
  var siteinfo = {
    mainpage: 'Main Page'
  };
  var actual = applyPatterns(input.split('\n'));
  assert.strictEqual(typeof actual, 'object', 'return type');
  assert.deepEqual(actual, expected.split('\n'), 'patterns');
}

function testContentHandling () {
  function testcase (title, content) {
    return Content.checkSubject(
      { pageName: title },
      content,
      // Disable interactive 'ask'
      { quiet: true }
    );
  }
  return Promise.all([
    assertPromise(
      testcase('foo.css', '.foo {}'),
      'resolved',
      'Valid CSS on a CSS page'
    ),
    assertPromise(
      testcase('foo.js', '.foo {}'),
      'rejected',
      'Valid CSS on a JS page'
    ),
    assertPromise(
      testcase('foo.js', 'foo();'),
      'resolved',
      'Valid JS on a JS page'
    ),
    assertPromise(
      testcase('foo.css', 'foo();'),
      // CSS is not currently validated
      'resolved',
      'Valid JS on a CSS page'
    )
  ]);
}

testContentHandling().catch(function (e) {
  console.error(e.stack);
  process.exit(1);
});

try {
  testReplacement();
} catch (e) {
  console.error(e.stack);
  process.exit(1);
}
