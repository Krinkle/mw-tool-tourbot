var assert = require('assert-diff');

var replace = require('../src/replace');

module.exports = function testReplace () {
  var siteinfo = {
    mainpage: 'Main Page',
    mainpagename: 'Main_Page'
  };
  var i = 1;
  var cases = [{
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
};
