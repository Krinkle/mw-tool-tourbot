var assert = require('assert-diff');
var fs = require('fs');
var path = require('path');

var Content = require('../src/content');
var Fixer = require('../src/fixer');
var diff = require('../src/diff');
var patterns = require('../src/patterns');
var replace = require('../src/replace');

async function assertPromise (actual, expected, message) {
  try {
    await actual;
  } catch (err) {
    assert.strictEqual('rejected', expected, message);
    return;
  }

  assert.strictEqual('resolved', expected, message);
}

function testReplace () {
  console.log('Test: Replace');
  var siteinfo = {
    mainpage: 'Main Page',
    mainpagename: 'Main_Page'
  };
  var i = 1;
  var cases = [ {
    regex: /foo/g,
    replacement: 'bar',
    input: 'input',
    expected: 'input'
  }, {
    regex: /foo/g,
    replacement: 'bar',
    input: 'input foos and bars',
    expected: 'input bars and bars'
  }, {
    regex: /two/g,
    replacement: '',
    input: 'one two three',
    expected: 'one  three'
  }, {
    regex: /two/g,
    replacement: '<tourbot-rm-blank>',
    input: 'two',
    expected: null
  }, {
    regex: /two/g,
    replacement: '<tourbot-rm-blank>',
    input: 'one two',
    expected: 'one '
  } ];
  for (let data of cases) {
    assert.strictEqual(
      replace(
        data.input,
        { regex: data.regex, replacement: data.replacement },
        siteinfo
      ),
      data.expected,
      i++
    );
  }
}

function testPatterns () {
  console.log('Test: Patterns');

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

async function testContentHandling () {
  console.log('Test: Content handling');

  function testcase (title, content) {
    return Content.checkSubject(
      { pageName: title },
      content,
      // Disable interactive 'ask'
      { quiet: true }
    );
  }
  await assertPromise(
    testcase('foo.css', '.foo {}'),
    'resolved',
    'Valid CSS on a CSS page'
  );
  await assertPromise(
    testcase('foo.js', '.foo {}'),
    'rejected',
    'Valid CSS on a JS page'
  );
  await assertPromise(
    testcase('foo.js', 'foo();'),
    'resolved',
    'Valid JS on a JS page'
  );
  await assertPromise(
    testcase('foo.css', 'foo();'),
    // CSS is not currently validated
    'resolved',
    'Valid JS on a CSS page'
  );
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
  diffTestCases.forEach(function testcase (data, i) {
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
  });
  process.stdout.write('\n');
}

async function testFixerGlobal () {
  console.log('Test: Fixer - match all');
  var calls = [];
  var fix = new Fixer(
    'start\nexample\none exam, two exams\nremove me',
    [ {
      regex: /([eaoui])xam/g,
      replacement: '$1-test',
      summary: 'xam to test'
    } ],
    {}
  );
  var result = await fix.run(
    function replacer (str, pattern) {
      if (str === 'remove me') {
        return null;
      }
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
      { i: 1, replacement: 'e-testple' },
      { i: 2, replacement: 'one e-test, two e-tests' },
      { i: 3, replacement: null }
    ],
    calls,
    'Calls'
  );
  assert.strictEqual(
    'start\nexample\none e-test, two e-tests',
    result.content,
    'Content'
  );
}

async function testFixerOne () {
  console.log('Test: Fixer - match one');
  var calls = [];
  var fix = new Fixer(
    'start\nexample\none exam, two exams\nremove me',
    [ {
      regex: /([eaoui])xam/,
      replacement: '$1-test',
      summary: 'xam to test'
    } ],
    {}
  );
  var result = await fix.run(
    function replacer (str, pattern) {
      if (str === 'remove me') {
        return null;
      }
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
      { i: 1, replacement: 'e-testple' },
      { i: 2, replacement: 'one e-test, two exams' },
      { i: 2, replacement: 'one e-test, two e-tests' },
      { i: 3, replacement: null }
    ],
    calls,
    'Calls'
  );
  assert.strictEqual(
    'start\nexample\none e-test, two e-tests',
    result.content,
    'Content'
  );
}

async function test () {
  try {
    testDiff();
    await testContentHandling();
    testReplace();
    testPatterns();
    await testFixerGlobal();
    await testFixerOne();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();
