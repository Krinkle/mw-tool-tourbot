var fs = require('fs');
var path = require('path');
var url = require('url');
var async = require('async');
var colors = require('colors/safe');
var minimist = require('minimist');
var MwClient = require('nodemw');
var opener = require('opener');

var auth = require('./auth');
var ask = require('./ask');
var Content = require('./content');
var replace = require('./replace');
var { SkipFileError, AbortError } = require('./error');
var patterns = require('./patterns');
var argv = minimist(process.argv.slice(2), {
  string: ['file', 'contains', 'match'],
  boolean: ['all'],
  default: { file: 'results.txt', all: false },
  alias: { f: 'file', a: 'all', c: 'contains', m: 'match' }
});
var bots = Object.create(null);
var dMap = null;

function parseResults (results) {
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

function enhanceMwClient (client) {
  // Added method
  client.getPage = function (title, callback) {
    var params = {
      action: 'query',
      prop: 'revisions',
      rvprop: 'content|timestamp',
      titles: title,
      formatversion: '2'
    };
    this.api.call(params, function (err, data) {
      if (err) {
        callback(err);
        return;
      }
      var page = data.pages[0];
      if (page.missing) {
        callback(new SkipFileError('Page [[' + title + ']] is missing'));
        return;
      }
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
  client.edit = function (pageData, content, summary, minor, callback) {
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

  // Cached and promisified version of getSiteInfo(['general'])
  client.siteinfo = function () {
    var client = this;
    if (this.dSiteinfo) {
      return this.dSiteinfo;
    }
    this.dSiteinfo = new Promise(function (resolve, reject) {
      client.getSiteInfo(['general'], function (err, info) {
        if (err) {
          reject(err);
          return;
        }
        // Simplify matching for wgPageName vs wgTitle
        info.general.mainpagename = info.general.mainpage.replace(/ /g, '_');
        resolve(info.general);
      });
    });
    return this.dSiteinfo;
  };
}

function getSimpleClient (server) {
  return new MwClient({
    protocol: 'https',
    server: server,
    path: '/w',
    concurrency: 2
  });
}

function getBotClient (server, auth) {
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

function getWikiMap () {
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

function printHeading (subject) {
  var wiki = subject.server || subject.wikiId;
  console.log('\n' + colors.bold.underline(subject.pageName) + ' (%s)\n', wiki);
}
function printSaving (subject, summary) {
  var wiki = subject.server || subject.wikiId;
  console.log('\nEdit summary: %s\nSaving edit on [[%s]] (%s)...',
    summary, colors.bold(subject.pageName), wiki);
}
function reportNoop () {
  console.log('No major changes. Loading next subject...');
}
function skipPage (err) {
  var reason = err && err.message ? ` (${err.message})` : '';
  console.log('Skipped%s. Loading next subject...', reason);
}
function openPage (subject) {
  subject.opened = true;
  if (!subject.server) {
    console.log('Unable to find url for [[%s]]...', subject.pageName);
    return;
  }
  var url = 'https://' + subject.server + '/wiki/' + subject.pageName;
  console.log('Opening %s...', colors.bold.underline(url));
  opener(url);
}
function printApplyHelp () {
  var help = (
    'y - apply this change\n' +
    'n - skip this change\n' +
    'e - open the page in a web browser, and skip the rest of this file\n' +
    'o - open the page in a web browser, but keep the change undecided\n' +
    's - skip this change and the rest of this file\n' +
    'h - print help\n'
  );
  console.log(colors.red.bold(help));
}
function simpleDiff (removedLine, addedLine) {
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

function handleContent (subject, content, siteinfo, callback) {
  var changedLines = content.split('\n');
  var summaries = {};
  var major = false;
  var shown = false;

  function proposeChange (pattern, line, i, nextLine) {
    if (line === null) {
      // If the line was removed by a previous pattern, skip it
      setImmediate(nextLine);
      return;
    }
    // If the line is removed (nulled), give diff the preview as empty string
    var preview = replace(line, pattern, siteinfo) || '';
    if (preview === line) {
      setImmediate(nextLine);
      return;
    }
    var contextSize = 5;
    var contextStart = Math.max(0, i - 5);
    var linesBefore = changedLines.slice(contextStart, i).join('\n');
    var linesAfter = changedLines.slice(i + 1, i + contextSize).join('\n');
    var diff = simpleDiff(line, preview);
    console.log(
      colors.cyan('@@ line ' + contextStart + ' @@') + '\n' +
      (linesBefore ? colors.grey(linesBefore) + '\n' : '') +
      colors.red('- ' + diff.textBefore) + colors.bold.bgRed(diff.removed) + colors.red(diff.textAfter) + '\n' +
      colors.green('+ ' + diff.textBefore) + colors.bold.bgGreen(diff.added) + colors.green(diff.textAfter) + '\n' +
      colors.grey(linesAfter)
    );
    function askApply () {
      shown = true;
      return ask.options('Apply change?', {
        yes: function (cb) {
          changedLines[i] = replace(line, pattern, siteinfo);
          if (pattern.summary) {
            major = true;
            summaries[pattern.summary] = true;
          }
          cb();
          nextLine();
        },
        no: function (cb) {
          cb();
          nextLine();
        },
        edit: function (cb) {
          cb();
          openPage(subject);
          nextLine(new SkipFileError('Editing in browser'));
        },
        open: function (cb) {
          cb();
          openPage(subject);
          askApply();
        },
        skip: function (cb) {
          cb();
          nextLine(new SkipFileError());
        },
        help: function (cb) {
          cb();
          printApplyHelp();
          askApply();
        }
      });
    }
    askApply();
  }

  printHeading(subject);

  Content.checkSubject(subject, content)
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
      // Strip nulled-out lines
      changedLines = changedLines.filter(function (line) {
        return line !== null;
      });
      callback(err, changedLines.join('\n'), Object.keys(summaries), shown);
    });
  })
  .catch(function (err) {
    callback(err, null, null, shown);
  });
}

function checkAll (options, subject, content) {
  if (options.all &&
    (!options.contains || content.indexOf(argv.contains) !== -1) &&
    (!options.match || new RegExp(options.match).test(content)) &&
    !subject.opened
  ) {
    return ask.confirm('Open in browser?').then(function (answer) {
      if (answer) {
        openPage(subject);
      }
    });
  }
  return Promise.resolve();
}

function handleSubject (subject, auth) {
  var pMap = getWikiMap();
  var pClient = pMap.then(function (map) {
    var wiki = map[subject.wikiId];
    if (!wiki) {
      return Promise.reject(new SkipFileError('Unknown wiki: ' + subject.wikiId));
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
  var pSiteinfo = pClient.then(function (client) {
    return client.siteinfo();
  });
  var pEdit = Promise.all([pClient, pPage, pSiteinfo]).then(function (vals) {
    var [ client, page, siteinfo ] = vals;
    return new Promise(function (resolve, reject) {
      handleContent(subject, page.revision.content, siteinfo, function (err, newContent, summaries, shown) {
        var pShown = checkAll(argv, subject, page.revision.content);
        pShown.then(function () {
          if (err) {
            reject(err);
            return;
          }
          if (!summaries.length) {
            if (shown) {
              // No change made, or only cleanup
              reportNoop();
            }
            resolve();
            return;
          }
          return Content.checkSubject(subject, newContent).then(function () {
            var summary = 'Maintenance: [[mw:RL/MGU]] / [[mw:RL/JD]] - ' + summaries.join(', ');
            printSaving(subject, summary);
            client.edit(page, newContent, summary, function (err) {
              err ? reject(err) : resolve(); // promisify
            });
          });
        }).catch(reject);
      });
    });
  });
  return pEdit;
}

function start (dAuth) {
  dAuth.then(function (auth) {
    console.log(colors.cyan('Reading %s'), path.resolve(argv.file));
    var results = fs.readFileSync(argv.file).toString();
    return new Promise(function (resolve, reject) {
      async.eachSeries(parseResults(results), function (subject, callback) {
        handleSubject(subject, auth).then(function () {
          callback();
        }, function (err) {
          if (err instanceof SkipFileError) {
            skipPage(err);
            callback();
            return;
          }
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

module.exports = function cli (authDir) {
  start(auth.getAuth(authDir));
};
