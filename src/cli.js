var fs = require('fs');
var path = require('path');
var url = require('url');
var colors = require('colors/safe');
var minimist = require('minimist');
var MwClient = require('nodemw');
var opener = require('opener');

var auth = require('./auth');
var ask = require('./ask');
var Content = require('./content');
var Diff = require('./diff');
var Fixer = require('./fixer');
var replace = require('./replace');
var { SkipFileError, AbortError } = require('./error');
var patterns = require('./patterns');
var argv = minimist(process.argv.slice(2), {
  string: ['file', 'contains', 'match'],
  boolean: ['all', 'verbose', 'help'],
  default: { file: 'results.txt', all: false, verbose: false, help: false },
  alias: { f: 'file', a: 'all', v: 'verbose', c: 'contains', m: 'match', h: 'help' }
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
      subjects.push({
        wikiId: parts[0],
        // Page names may contain spaces
        pageName: parts.slice(1).join(' ')
      });
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
    concurrency: 2,
    debug: !!argv.verbose
  });
}

function getBotClient (server, authObj) {
  if (!bots[server]) {
    bots[server] = new Promise(function (resolve, reject) {
      var client = new MwClient({
        protocol: 'https',
        server: server,
        path: '/w',
        concurrency: 2,
        username: authObj.botname,
        password: authObj.botpass,
        debug: !!argv.verbose
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

/**
 * @return {Promise} Map object
 */
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

function printHeading (pageName, wiki) {
  console.log('\n' + colors.bold.underline(pageName) + ' (%s)\n', wiki);
}
function printSaving (subject, summary) {
  var wiki = subject.server || subject.wikiId;
  console.log('\nEdit summary: %s\nSaving edit on [[%s]] (%s)...',
    summary, colors.bold(subject.pageName), wiki);
}
function reportNoop () {
  console.log('No major changes. Loading next subject...');
}
function failPage (err) {
  var message;
  if (err instanceof SkipFileError) {
    message = `Skipped (${err.message})`;
  } else {
    message = 'Failed. ' + err.toString() + '\n';
  }
  console.log(`${message} Loading next subject...`);
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

async function handleContent (subject, content, siteinfo) {
  var shown = false;

  function proposeChange (lines, i, line, replacement) {
    var contextSize = 5;
    var contextStart = Math.max(0, i - 5);
    var linesBefore = lines.slice(contextStart, i).join('\n');
    var linesAfter = lines.slice(i + 1, i + contextSize).join('\n');
    var diff = Diff.simpleDiff(line, replacement);
    console.log(Diff.formatDiff(diff, contextStart, linesBefore, linesAfter));
    function askApply () {
      shown = true;
      return ask.options('Apply change?', {
        yes: function (cb) {
          cb(null, true);
        },
        no: function (cb) {
          cb();
        },
        edit: function (cb) {
          cb(new SkipFileError('Editing in browser'));
          openPage(subject);
        },
        open: function (cb) {
          openPage(subject);
          askApply().then(function (answer) {
            cb(null, answer);
          }, cb);
        },
        skip: function (cb) {
          cb(new SkipFileError());
        },
        help: function (cb) {
          printApplyHelp();
          askApply().then(function (answer) {
            cb(null, answer);
          }, cb);
        }
      });
    }
    return askApply();
  }

  await Content.checkSubject(subject, content);
  var fix = new Fixer(content, patterns, siteinfo);
  var result = await fix.run(replace, proposeChange);
  return {
    ...result,
    shown
  };
}

async function checkAll (options, subject, content) {
  if (options.all &&
    (!options.contains || content.indexOf(argv.contains) !== -1) &&
    (!options.match || new RegExp(options.match).test(content)) &&
    !subject.opened
  ) {
    let answer = await ask.confirm('Open in browser?');
    if (answer) {
      openPage(subject);
    }
  }
}

async function handleSubject (subject, authObj) {
  var map = await getWikiMap();
  var wiki = map[subject.wikiId];
  if (!wiki) {
    printHeading(subject.pageName, subject.wikiId);
    throw new SkipFileError('Unknown wiki: ' + subject.wikiId);
  }
  // Hack for printSaving() and openPage()
  subject.server = wiki.server;

  printHeading(subject.pageName, wiki.server);
  if (subject.pageName === 'MediaWiki:Gadget-popups.js') {
    throw new SkipFileError('False positive');
  }
  var client = await getBotClient(wiki.server, authObj);
  var page = await new Promise(function (resolve, reject) {
    client.getPage(subject.pageName, function (err, data) {
      err ? reject(err) : resolve(data); // promisify
    });
  });
  var siteinfo = await client.siteinfo();
  var result;
  try {
    result = await handleContent(subject, page.revision.content, siteinfo);
  } catch (err) {
    // Before discarding, offer to "open" if needed
    await checkAll(argv, subject, page.revision.content);
    throw err;
  }

  // Before saving, offer to "open" if needed
  await checkAll(argv, subject, page.revision.content);

  var newContent = result.content;
  var summaries = result.summaries;
  var shown = result.shown;
  if (!summaries.length) {
    if (shown) {
      // No change made, or only minor cleanup
      reportNoop();
    }
    return;
  }

  await Content.checkSubject(subject, newContent);
  var summary = 'Maintenance: [[mw:RL/MGU]] - ' + summaries.join(', ');
  printSaving(subject, summary);
  // Save edit
  await new Promise(function (resolve, reject) {
    client.edit(page, newContent, summary, function (err) {
      err ? reject(new SkipFileError(err.message)) : resolve(); // promisify
    });
  });
}

async function start (authDir) {
  try {
    var authObj = await auth.getAuth(authDir);
    console.log(colors.cyan('Reading %s'), path.resolve(argv.file));
    var results = fs.readFileSync(argv.file).toString();
    for (let subject of parseResults(results)) {
      try {
        await handleSubject(subject, authObj);
      } catch (err) {
        failPage(err);
      }
    }
  } catch (mainErr) {
    if (mainErr instanceof AbortError) {
      return;
    }
    if (mainErr) {
      console.error(mainErr);
      process.exit(1);
    }
  }
}

module.exports = function cli (authDir) {
  if (argv.help) {
    console.log('Help for Tourbot v' + require('../package.json').version);
    console.log('  -f, --file\t\tString, file containing list of pages to process. Default: results.txt');
    console.log('  -a, --all\t\tBoolean, iterate over all page names even without matches. Default: false');
    console.log('  -c, --contains\tString, Limit the `all` iteration to pages that currently contain a particular phrase.');
    console.log('  -m, --match\t\tString, Like `contains`, but interpreted as a regular expression.');
    console.log('  -v, --verbose\t\tBoolean, enable debug logging. Default: false');
    console.log('  -h, --help\t\tBoolean, shows this help page. Default: false');
  } else {
    start(authDir);
  }
};
