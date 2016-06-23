/**
 * Based on abbrev@1.0.9. Modified to implement a 'shortest' option.
 *
 * - https://github.com/isaacs/abbrev-js
 * - https://www.npmjs.com/package/abbrev
 *
 * @license The ISC License

Copyright (c) Isaac Z. Schlueter and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

function abbrev(input, options = {}) {
	for (var i = 0, values = [] ; i < input.length; i++) {
		values[i] = String(input[i]);
	}

	// sort them lexicographically, so that they're next to their nearest kin
	values = values.sort(lexSort);

	// walk through each, seeing how much it has in common with the next and previous
	var abbrevs = {},
		prev = '';
	for (i = 0; i < values.length; i++) {
		var current = values[i],
			next = values[i + 1] || '',
			nextMatches = true,
			prevMatches = true;
		// Ignore duplicates
		if (current === next) continue;
		for (var j = 0, cl = current.length; j < cl; j++) {
			var curChar = current[j];
			nextMatches = nextMatches && curChar === next[j];
			prevMatches = prevMatches && curChar === prev[j];
			if (!nextMatches && !prevMatches) {
				j++;
				break;
			}
		}
		prev = current;
		if (j === cl) {
			abbrevs[current] = current;
			continue;
		}
		for (var a = current.substr(0, j); j <= cl; j++) {
			abbrevs[a] = current;
			if (options.shortest) {
				break;
			}
			a += current[j];
		}
	}
	return abbrevs;
}

function lexSort (a, b) {
	return a === b ? 0 : a > b ? 1 : -1;
}

module.exports = abbrev;
