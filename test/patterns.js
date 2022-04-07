/* eslint-env qunit */

const fs = require('fs');
const path = require('path');

const replace = require('../src/replace');
const patterns = require('../src/patterns');

function applyPatterns (lines) {
  let output = lines.slice();
  const siteinfo = {
    general: {
      mainpage: 'Main Page',
      mainpagename: 'Main_Page'
    },
    custom: {
      shortMonthNames: '[ "", "Jan", "Feb", "…", "Dec" ]'
    }
  };
  patterns.forEach(function (pattern) {
    output.forEach(function (input, i) {
      let result = input;
      // Emulate what fixer.js does:
      // Create a clone of the pattern and match multiple times until it no longer changes
      do {
        if (result === null) {
          break;
        }
        const clonePattern = Object.create(pattern);
        clonePattern.regex = new RegExp(
          pattern.regex.source,
          pattern.regex.flags
        );
        input = result;
        result = replace(input, clonePattern, siteinfo);
      } while (input !== result);

      output[i] = result;
    });
  });
  output = output.filter(function (line) {
    return line !== null;
  });
  // Join and resplit so that there is always one line per array item.
  // This is required so that multi-line replacements can be compared
  // correctly between the actual and expected output.
  return output.join('\n').split('\n');
}

// Read test cases
const fixtureDir = path.join(__dirname, 'fixture');
const inputSuffix = '-input.txt';
const expectSuffix = '-expect.txt';
const testCases = {};
const filenames = fs.readdirSync(fixtureDir);
filenames.forEach((filename) => {
  if (filename.endsWith(inputSuffix)) {
    const label = filename.replace(inputSuffix, '');
    const inputFile = filename;
    const expectFile = filename.replace(inputSuffix, expectSuffix);
    if (!filenames.includes(expectFile)) {
      throw new Error(`File ${inputFile} needs ${expectFile} to exist`);
    }
    testCases[label] = [inputFile, expectFile];
  } else if (filename.endsWith(expectSuffix)) {
    const label = filename.replace(expectSuffix, '');
    const expectFile = filename;
    const inputFile = filename.replace(expectSuffix, inputSuffix);
    if (!filenames.includes(inputFile)) {
      throw new Error(`File ${expectFile} needs ${inputFile} to exist`);
    }
    testCases[label] = [inputFile, expectFile];
  } else {
    throw new Error(`Unexpected file ${filename} found in fixture directory`);
  }
});

QUnit.module('patterns');

for (const label in testCases) {
  QUnit.test(label, (assert) => {
    const input = fs.readFileSync(path.join(fixtureDir, testCases[label][0])).toString().split('\n');
    const expect = fs.readFileSync(path.join(fixtureDir, testCases[label][1])).toString().split('\n');
    const actual = applyPatterns(input);
    assert.strictEqual(typeof actual, 'object', 'return type');
    assert.strictEqual(actual.length, expect.length, 'number of lines in output');
    for (let i = 0; i < Math.max(actual.length, expect.length); i++) {
      assert.strictEqual(actual[i], expect[i], `line ${i + 1}`);
    }
  });
}
