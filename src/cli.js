var acorn = require('acorn');
var async = require('async');
var colors = require('colors/safe');
var MwClient = require('nodemw');
var opener = require('opener');
var path = require('path');
var readline = require('readline');
var url = require('url');

var { SkipFileError, AbortError } = require('./error');
var patterns = require('./patterns');
var argv = require('minimist')(process.argv.slice(2), {
	default: { file: 'results.txt' }
});
var bots = Object.create(null);
var dMap = null;

function parseResults(results) {
	var lines = results.trim().split('\n');
	return lines.reduce(function (subjects, line) {
		var text = line.trim();
		// Filter empty lines and comments
		if (text && text[0] !== '#') {
			var parts = line.split(/\s+/);
			// Dangerous false positive.
			if (parts[1] !== 'MediaWiki:Gadget-popups.js') {
				subjects.push({
					wikiId: parts[0],
					// Page names may contain spaces
					pageName: parts.slice(1).join(' ')
				});
			}
		}
		return subjects;
	}, []);
}

function enhanceMwClient(client) {
	// Added method
	client.getPage = function(title, callback) {
		var params = {
			action: 'query',
			prop: 'revisions',
			rvprop: 'content|timestamp',
			titles: title,
			formatversion: '2'
		};
		this.api.call(params, function(err, data) {
			if (err) {
				callback(err);
				return;
			}
			var page = data.pages[0];
			var revision = page.revisions && page.revisions[0];
			var resp = {
				title: page.title,
				revision: {
					timestamp: revision.timestamp,
					content: revision.content
				}
			};

			callback(null, resp);
		});
	};
	// Replaced method (must be backward-compatible)
	client.edit = function(pageData, content, summary, minor, callback) {
		var params = {
			text: content,
			// Avoid accidentally editing as anonymous user if session expires
			assert: 'user'
		};

		if (typeof minor === 'function') {
			callback = minor;
			minor = undefined;
		}

		if (minor) {
			params.minor = '';
		} else {
			params.notminor = '';
		}

		var title;
		if (typeof pageData === 'object') {
			params.basetimestamp = pageData.revision.timestamp;
			params.starttimestamp = new Date().toISOString();
			// Avoid accidentally creating a new page (e.g. if title string got corrupted,
			// or if page was deleted meanwhile).
			params.nocreate = '';
			title = pageData.title;
		} else {
			title = pageData;
		}

		this.doEdit('edit', title, summary, params, callback);
	};
}

function getSimpleClient(server) {
	return new MwClient({
		protocol: 'https',
		server: server,
		path: '/w',
		concurrency: 2
	});
}

function getBotClient(server, auth) {
	if (!bots[server]) {
		bots[server] = new Promise(function (resolve, reject) {
			var client = new MwClient({
				protocol: 'https',
				server: server,
				path: '/w',
				concurrency: 2,
				username: auth.botname,
				password: auth.botpass
			});
			client.logIn(function (err) {
				if (err) {
					reject(err);
					return;
				}
				enhanceMwClient(client);
				resolve(client);
			});
		});
	}
	return bots[server];
}

function getWikiMap() {
	if (dMap) {
		return dMap;
	}
	dMap = new Promise(function (resolve, reject) {
		var client = getSimpleClient('meta.wikimedia.org');
		client.api.call({
			action: 'sitematrix',
			smlangprop: 'site',
			smsiteprop: 'url|dbname'
		}, function (err, sitematrix) {
			var map, key, group, i, wiki;
			if (err) {
				reject(err);
				return;
			}
			map = Object.create(null);
			for (key in sitematrix) {
				if (key === 'count') {
					continue;
				}
				group = key === 'specials' ? sitematrix[key] : sitematrix[key].site;
				if (group && group.length) {
					for (i = 0; i < group.length; i++) {
						if (group[i].private === undefined &&
							group[i].closed === undefined &&
							group[i].nonglobal === undefined &&
							group[i].fishbowl === undefined
						) {
							wiki = group[i];
							wiki.server = url.parse(wiki.url).host;
							map[wiki.dbname] = wiki;
						}
					}
				}
			}
			resolve(map);
		});
	});
	return dMap;
}

function printHeading(subject) {
	var wiki = subject.server || subject.wikiId;
	console.log('\n' + colors.bold.underline(subject.pageName) + ' (%s)\n', wiki);
}
function printSaving(subject, summary) {
	var wiki = subject.server || subject.wikiId;
	console.log('\nEdit summary: %s\nSaving edit on [[%s]] (%s)...',
		summary, colors.bold(subject.pageName), wiki);
}
function printSkipping() {
	console.log('No major changes. Loading next subject...');
}
function skipPage() {
	console.log('Skipped. Loading next subject...');
}
function openPage(subject) {
	if (!subject.server) {
		console.log('Unable to find url for [[%s]]...', subject.pageName);
		return;
	}
	var url = 'https://' + subject.server + '/wiki/' + subject.pageName;
	console.log('Opening %s...', colors.bold.underline(url));
	opener(url);
}
function printApplyHelp() {
	var help = (
		'y - apply this change\n' +
		'n - skip this change\n' +
		'e - open the page in a web browser, and skip the rest of this file\n' +
		'o - open the page in a web browser, but keep the change undecided\n' +
		's - skip this change and the rest of this file\n' +
		'? - print help\n'
	);
	console.log(colors.red.bold(help));
}
function simpleDiff(removedLine, addedLine) {
	if (removedLine === addedLine) {
		return { textBefore: removedLine, removed: '', added: '', textAfter: '' };
	}
	var start = 0;
	while (start < removedLine.length && removedLine[start] === addedLine[start]) {
		start++;
	}
	var textBefore = removedLine.slice(0, start);
	var remaining = removedLine.slice(start);
	var end = false;
	if (remaining.length) {
		end = 0;
		while (remaining.slice(end - 1, remaining.length + end) === addedLine.slice(end - 1, addedLine.length + end)) {
			end--;
		}
	}

	return {
		textBefore: textBefore,
		removed: removedLine.slice(start, end || undefined),
		added: addedLine.slice(start, end || undefined),
		textAfter: end ? remaining.slice(end) : ''
	};
}

function handleContent(subject, content, callback) {
	var changedLines = content.split('\n');
	var summaries = {};
	var major = false;
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		historySize: 0
	});

	function checkScript() {
		return new Promise(function (resolve, reject) {
			function ask(error) {
				rl.question(colors.red.bold(error.toString()) + '\nContinue? (y/n) ', function (answer) {
					var char = answer.trim().toLowerCase();
					if (char === 'y') {
						resolve();
						return;
					}
					if (char === 'n') {
						reject(new SkipFileError());
						return;
					}
					ask(error);
				});
			}
			try {
				acorn.parse(content);
				resolve();
				return;
			} catch (e) {
				ask(e);
			}
		});
	}

	function proposeChange(pattern, line, i, nextLine) {
		var preview = line.replace(pattern.regex, pattern.replacement);
		if (preview === line) {
			setImmediate(nextLine);
			return;
		}
		var contextSize = 5;
		var contextStart = Math.max( 0, i - 5 );
		var linesBefore = changedLines.slice( contextStart, i ).join('\n');
		var linesAfter = changedLines.slice( i + 1, i + contextSize ).join('\n');
		var diff = simpleDiff(line, preview);
		console.log(
			colors.cyan('@@ line ' + contextStart + ' @@') + '\n' +
			colors.grey(linesBefore) + '\n' +
			diff.textBefore + colors.bold.bgRed(diff.removed) + diff.textAfter + '\n' +
			diff.textBefore + colors.bold.bgGreen(diff.added) + diff.textAfter + '\n' +
			colors.grey(linesAfter)
		);
		function askApply() {
			rl.question('Apply change? (y, n, e, o, s, ? help) ', function (answer) {
				var char = answer.trim().toLowerCase();
				if (char === 'y') {
					changedLines[i] = line.replace(pattern.regex, pattern.replacement);
					if (pattern.summary) {
						major = true;
						summaries[pattern.summary] = true;
					}
					nextLine();
					return;
				}
				if (char === 'n') {
					nextLine();
					return;
				}
				if (char === 'e') {
					openPage(subject);
					nextLine(new SkipFileError());
					return;
				}
				if (char === 'o') {
					openPage(subject);
					askApply();
					return;
				}
				if (char === 's') {
					skipPage();
					nextLine(new SkipFileError());
					return;
				}
				// "?", "?help", "? help", "h", "help"
				if (char[0] === '?' || (char[0] === 'h' && char.length < 5)) {
					printApplyHelp();
					askApply();
					return;
				}
				// Unknown key, return to question
				askApply();
			});
		}
		askApply();
	}

	printHeading(subject);

	checkScript()
		.then(function () {
			async.eachSeries(patterns, function (pattern, nextPattern) {
				// If we reached a minor pattern, but had no major patterns yet, don't propose
				// other changes. The edit handler requires at least one major change.
				if (!pattern.summary && !major) {
					setImmediate(nextPattern);
					return;
				}
				async.forEachOfSeries(changedLines, function (line, i, nextLine) {
					proposeChange(pattern, line, i, nextLine);
				}, function (err) {
					nextPattern(err);
				});
			}, function (err) {
				rl.close();
				callback(err, changedLines.join('\n'), Object.keys(summaries));
			});
		})
		.catch(function (err) {
			callback(err);
		});
}

function handleSubject(subject, auth) {
	var pMap = getWikiMap();
	var pClient = pMap.then(function (map) {
		var wiki = map[subject.wikiId];
		if (!wiki) {
			return Promise.reject(new Error('Unknown wiki: ' + subject.wikiId));
		}
		// Hack - augment subject object for print convenience
		subject.server = wiki.server;
		return getBotClient(wiki.server, auth);
	});
	var pPage = pClient.then(function (client) {
		return new Promise(function (resolve, reject) {
			client.getPage(subject.pageName, function (err, data) {
				err ? reject(err) : resolve(data); // promisify
			});
		});
	});
	var pEdit = Promise.all([pClient, pPage]).then(function (vals) {
		var [ client, page ] = vals;
		return new Promise(function (resolve, reject) {
			handleContent(subject, page.revision.content, function (err, newContent, summaries) {
				if (err) {
					if (err instanceof SkipFileError) {
						resolve();
						return;
					}
					reject(err);
					return;
				}
				if (!summaries.length) {
					// No change made, or only cleanup
					printSkipping();
					resolve();
					return;
				}
				var summary = 'Maintenance: [[mw:RL/MGU]] / [[mw:RL/JD]] - ' + summaries.join(', ');
				printSaving(subject, summary);
				client.edit(page, newContent, summary, function (err) {
					err ? reject(err) : resolve(); // promisify
				});
			});
		});
	});
	return pEdit;
}

function start(dAuth) {
	dAuth.then(function (auth) {
		console.log(colors.cyan('Reading %s'), path.resolve(argv.file));
		var results = require('fs').readFileSync(argv.file).toString();
		return new Promise(function (resolve, reject) {
			async.eachSeries(parseResults(results), function (subject, callback) {
				handleSubject(subject, auth).then(function () {
					callback();
				}, function (err) {
					callback(err);
				});
			}, function (err) {
				err ? reject(err) : resolve(); // promisify
			});
		});
	})
	.catch(function (err) {
		if (err instanceof AbortError) {
			return;
		}
		if (err) {
			console.error(err);
		}
	});
}

module.exports = function cli(authDir) {
	var auth = require('./auth').getAuth(authDir);
	start(auth);
};
