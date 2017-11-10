var assert = require('assert-diff');
var fs = require('fs');
var path = require('path');

var replace = require('../src/replace');
var patterns = require('../src/patterns');

function applyPatterns (lines) {
  var output = lines.slice();
  var siteinfo = {
    mainpage: 'Main Page',
    mainpagename: 'Main_Page'
  };
  patterns.forEach(function (pattern) {
    var matchAllPattern = Object.create(pattern);
    matchAllPattern.regex = new RegExp(
      pattern.regex.source,
      pattern.regex.flags.replace(/g/g, '') + 'g'
    );
    output.forEach(function (line, i) {
      if (line !== null) {
        output[i] = replace(line, matchAllPattern, siteinfo);
      }
    });
  });
  output = output.filter(function (line) {
    return line !== null;
  });
  return output;
}

module.exports = function testPatterns () {
  var input = fs.readFileSync(path.join(__dirname, 'fixture', 'input.txt')).toString();
  var expected = fs.readFileSync(path.join(__dirname, 'fixture', 'expected.txt')).toString();
  var actual = applyPatterns(input.split('\n'));
  assert.strictEqual(typeof actual, 'object', 'return type');
  assert.deepEqual(actual, expected.split('\n'), 'patterns');
};
