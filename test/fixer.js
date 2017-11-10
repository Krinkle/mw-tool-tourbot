var assert = require('assert-diff');

var Fixer = require('../src/fixer');

module.exports = {
  async testFixerMatchAll () {
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
  },

  async testFixerMatchOne () {
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
};
