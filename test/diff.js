/* eslint-env qunit */

const diff = require('../src/diff');
const colors = require('colors/safe');

let diffTestCases = [
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
    },
    formatted: `@@ line 1 @@
  Before 1
  Before 2
- Required: foo, bar
+ Required: bar
  After 1`
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
    },
    formatted: `@@ line 1 @@
  Before 1
  Before 2
- One thing
+ Something else
  After 1`
  },
  {
    input: {
      removed: 'One line.',
      added: null
    },
    result: {
      textBefore: '',
      removed: 'One line.',
      added: null,
      textAfter: ''
    },
    formatted: `@@ line 1 @@
  Before 1
  Before 2
- One line.
  After 1`
  },
  {
    input: {
      removed: 'One thing',
      added: 'One bigger thing\nover multiple lines'
    },
    result: {
      textBefore: 'One ',
      removed: 'thing',
      added: 'bigger thing\nover multiple lines',
      textAfter: ''
    },
    formatted: `@@ line 1 @@
  Before 1
  Before 2
- One thing
+ One bigger thing
+ over multiple lines
  After 1`
  }
];

QUnit.module('diff');

diffTestCases.forEach((data, i) => {
  QUnit.test(`case @${i}`, (assert) => {
    let result = diff.simpleDiff(data.input.removed, data.input.added);

    assert.deepEqual(result, data.result, 'result value');
    assert.strictEqual(
      result.textBefore + result.removed + result.textAfter,
      data.input.removed,
      'removed value'
    );
    if (data.input.added !== null) {
      assert.strictEqual(
        result.textBefore + result.added + result.textAfter,
        data.input.added,
        'added value'
      );
    }
    assert.strictEqual(
      colors.strip(diff.formatDiff(result, 1, 'Before 1\nBefore 2', 'After 1')),
      data.formatted,
      'formatted value'
    );
  });
});
