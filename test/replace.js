/* eslint-env qunit */

const replace = require('../src/replace');

const siteinfo = {
  mainpage: 'Main Page',
  mainpagename: 'Main_Page'
};
const cases = [{
  regex: /foo/,
  replacement: 'bar',
  input: 'input',
  expected: 'input'
}, {
  regex: /foo/,
  replacement: 'bar',
  input: 'input foos and bars',
  expected: 'input bars and bars'
}, {
  regex: /two/,
  replacement: '',
  input: 'one two three',
  expected: 'one  three'
}, {
  regex: /two/,
  replacement: '<tourbot-rm-blank>',
  input: 'two',
  expected: null
}, {
  regex: /two/,
  replacement: '<tourbot-rm-blank>',
  input: 'one two',
  expected: 'one '
}];

QUnit.module('replace');

cases.forEach((data, i) => {
  QUnit.test(`case @${i}`, (assert) => {
    assert.strictEqual(
      replace(
        data.input,
        { regex: data.regex, replacement: data.replacement },
        siteinfo
      ),
      data.expected
    );
  });
});
