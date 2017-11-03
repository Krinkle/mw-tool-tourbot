var assert = require('assert-diff');
var fs = require('fs');
var path = require('path');

var Content = require('../src/content');
var Fixer = require('../src/fixer');
var diff = require('../src/diff');
var patterns = require('../src/patterns');
var replace = require('../src/replace');

function assertPromise (actual, expected, message) {
  return actual.then(function () {
    assert.strictEqual('resolved', expected, message);
  }, function () {
    assert.strictEqual('rejected', expected, message);
  });
}

function testReplace () {
  console.log('Test: Replace');

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
    mainpage: 'Main Page',
    mainpagename: 'Main_Page'
  };
  var actual = applyPatterns(input.split('\n'));
  assert.strictEqual(typeof actual, 'object', 'return type');
  assert.deepEqual(actual, expected.split('\n'), 'patterns');
}

function testContentHandling () {
  console.log('Test: Content handling');

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

function testDiff () {
  process.stdout.write('Test: Diff ');

  var diffTestCases = [
    {
      input: {
        removed: 'Required: foo, bar',
        added: 'Required: bar'
      },
      result: {
        textBefore: 'Required: ',
        removed: 'foo, ',
        added: '',
        textAfter: 'bar'
      }
    },
    {
      input: {
        removed: 'One thing',
        added: 'Something else'
      },
      result: {
        textBefore: '',
        removed: 'One thing',
        added: 'Something else',
        textAfter: ''
      }
    }
  ];
  diffTestCases.forEach(testDiff);
  function testDiff (data, i) {
    process.stdout.write('.');
    var result = diff.simpleDiff(data.input.removed, data.input.added);
    assert.deepEqual(
      result,
      data.result,
      `diff ${i} simple`
    );
    assert.strictEqual(
      result.textBefore + result.removed + result.textAfter,
      data.input.removed,
      `diff ${i} reconstruct removed`
    );
    assert.strictEqual(
      result.textBefore + result.added + result.textAfter,
      data.input.added,
      `diff {$i} reconstruct added`
    );
  }
  process.stdout.write('\n');
}

async function testFixer () {
  console.log('Test: Fixer');
  var calls = [];
  var fix = new Fixer(
    'start\nexample\nexams',
    [ {
      regex: /([eaoui])xam/g,
      replacement: '$1-test',
      summary: 'xam to test'
    } ],
    {}
  );
  var result = await fix.run(
    function replacer (str, pattern) {
      return str.replace(pattern.regex, pattern.replacement);
    },
    function accepter (lines, i, line, replacement) {
      calls.push({ i, replacement });
      if (line === 'example') {
        return false;
      }
      return true;
    }
  );
  assert.deepEqual(
    [
      { i: 0, replacement: 'start' },
      { i: 1, replacement: 'e-testple' },
      { i: 2, replacement: 'e-tests' }
    ],
    calls
  );
  assert.strictEqual(
    'start\nexample\ne-tests',
    result.content
  );
}

async function test () {
  try {
    testDiff();
    await testContentHandling();
    testReplace();
    await testFixer();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
