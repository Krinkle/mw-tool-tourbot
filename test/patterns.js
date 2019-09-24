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
  // Read test cases
  var fixtureDir = path.join(__dirname, 'fixture');
  var inputSuffix = '-input.txt';
  var expectSuffix = '-expect.txt';
  var testCases = {};
  var filenames = fs.readdirSync(fixtureDir);
  filenames.forEach((filename) => {
    if (filename.endsWith(inputSuffix)) {
      let label = filename.replace(inputSuffix, '');
      let inputFile = filename;
      let expectFile = filename.replace(inputSuffix, expectSuffix);
      if (!filenames.includes(expectFile)) {
        throw new Error(`File ${inputFile} needs ${expectFile} to exist`);
      }
      testCases[label] = [inputFile, expectFile];
    } else if (filename.endsWith(expectSuffix)) {
      let label = filename.replace(expectSuffix, '');
      let expectFile = filename;
      let inputFile = filename.replace(expectSuffix, inputSuffix);
      if (!filenames.includes(inputFile)) {
        throw new Error(`File ${expectFile} needs ${inputFile} to exist`);
      }
      testCases[label] = [inputFile, expectFile];
    } else {
      throw new Error(`Unexpected file ${filename} found in fixture directory`);
    }
  });
  // Run them
  for (let label in testCases) {
    let input = fs.readFileSync(path.join(fixtureDir, testCases[label][0])).toString().split('\n');
    let expect = fs.readFileSync(path.join(fixtureDir, testCases[label][1])).toString().split('\n');
    let actual = applyPatterns(input);
    assert.strictEqual(typeof actual, 'object', `return type for "${label}" fixture`);
    assert.strictEqual(actual.length, expect.length, `number of lines for "${label}" fixture`);
    assert.deepEqual(actual, expect, `output of "${label}" fixture`);
  }
};
