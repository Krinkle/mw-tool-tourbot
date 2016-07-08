var assert = require('assert-diff');
var fs = require('fs');

var patterns = require('../src/patterns');
var input = fs.readFileSync(__dirname + '/testcase.txt').toString();
var expected = fs.readFileSync(__dirname + '/expected.txt').toString();

function applyPatterns(lines) {
	var output = lines.slice();
	patterns.forEach(function (pattern) {
		output.forEach(function (line, i) {
			output[i] = line.replace(pattern.regex, pattern.replacement);
		});
	});
	return output;
}

assert.deepEqual(applyPatterns(input.split('\n')), expected.split('\n'), 'patterns');
