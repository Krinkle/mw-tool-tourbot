const fs = require('fs');
const path = require('path');
const URL = require('url').URL;
const util = require('util');
const os = require('os');

const colors = require('colors/safe');
const minimist = require('minimist');
const MwClient = require('nodemw');
const opener = require('opener');

const auth = require('./auth');
const ask = require('./ask');
const DecisionStore = require('./store').DecisionStore;
const Content = require('./content');
const Diff = require('./diff');
const Fixer = require('./fixer');
const parseResults = require('./file.js').parseResults;
const replace = require('./replace');
const { SkipFileError, SkipPatternError, AbortError } = require('./error');
const patterns = require('./patterns');
const argv = minimist(process.argv.slice(2), {
  string: ['config', 'file', 'contains', 'match'],
  boolean: ['all', 'auto', 'verbose', 'help'],
  default: {
    config: null,
    file: 'results.txt',
    contains: null,
    match: null,
    all: false,
    auto: false,
    verbose: false,
    help: false
  },
  alias: {
    f: 'file',
    c: 'contains',
    m: 'match',
    a: 'all',
    x: 'auto',
    v: 'verbose',
    h: 'help'
  }
});
const bots = Object.create(null);
let dMap = null;
const getPageCache = { title: null, promise: null };
let decisionCache;

function enhanceMwClient (client) {
  // Added promise methods
  client.pLogin = util.promisify(client.logIn);
  client.pCall = function (params, method = 'GET') {
    return new Promise((resolve, reject) => {
      client.api.call(
        params,
        function (err, data) {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        },
        method
      );
    });
  };
  client.pGetToken = util.promisify(client.getToken);

  // Added method
  client.getPage = async function (title) {
    const params = {
      action: 'query',
      prop: 'revisions',
      rvprop: 'content|timestamp',
      titles: title,
      formatversion: '2'
    };
    const data = await this.pCall(params);
    const page = data.pages[0];
    if (page.missing) {
      throw new SkipFileError('Page [[' + title + ']] is missing');
    }
    const revision = page.revisions && page.revisions[0];
    const resp = {
      title: page.title,
      revision: {
        timestamp: revision.timestamp,
        content: revision.content
      }
    };
    return resp;
  };

  // Replaced method (must be backward-compatible)
  client.edit = function (pageData, content, summary, minor, callback) {
    const params = {
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

    let title;
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

  // Added method
  // Cached and promisified version of
  // - query=siteinfo&siprop=
  // - query=allmessages&ammessages=…&uselang=content
  client.siteinfo = function () {
    if (this.dSiteinfo) {
      return this.dSiteinfo;
    }
    this.dSiteinfo = Promise.all([
      new Promise((resolve, reject) => {
        this.getSiteInfo(['general'], function (err, info) {
          if (err) {
            reject(err);
            return;
          }
          // Simplify matching for wgPageName vs wgTitle
          info.general.mainpagename = info.general.mainpage.replace(/ /g, '_');
          resolve(info.general);
        });
      }),
      Promise.resolve((async () => {
        const messageNames = [
          'jan', 'feb', 'mar', 'apr', 'may', 'jun',
          'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
        ];
        const params = {
          formatversion: '2',
          action: 'query',
          meta: 'allmessages',
          ammessages: messageNames.join('|'),
          uselang: 'content'
        };
        const data = await this.pCall(params);
        const messages = {};
        data.allmessages.forEach((msg) => {
          messages[msg.name] = msg.content;
        });
        return messages;
      })())
    ]).then((datas) => {
      const shortMonthNamesKeys = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
      ];
      const shortMonthNames = '[ ' + ['""', ...shortMonthNamesKeys.map((key) => {
        return JSON.stringify(datas[1][key]);
      })].join(', ') + ' ]';

      return {
        general: datas[0],
        messages: datas[1],
        custom: {
          shortMonthNames
        }
      };
    });
    return this.dSiteinfo;
  };
}

async function makeBotClient (server, authObj) {
  const client = new MwClient({
    protocol: 'https',
    server,
    path: '/w',
    concurrency: 2,
    username: authObj.botname,
    password: authObj.botpass,
    debug: !!argv.verbose
  });

  // Mixin extra methods
  enhanceMwClient(client);

  // Login
  await client.pLogin();

  // Ensure PST protection is in place (T236828)
  const options = await client.pCall({
    formatversion: '2',
    action: 'query',
    meta: 'userinfo',
    uiprop: 'options'
  });
  if (Number(options.userinfo.options['pst-cssjs']) !== 0) {
    console.log(`... setting user preference pst-cssjs=0 on ${server} for T236828.`);
    const csrfToken = await client.pGetToken(null, 'csrf');
    const resp = await client.pCall({
      action: 'options',
      token: csrfToken,
      optionname: 'pst-cssjs',
      optionvalue: '0'
    }, 'POST');
    if (resp !== 'success') {
      throw new Error(`Failed to set user preference: ${resp}`);
    }
  }

  return client;
}

function getBotClient (server, authObj) {
  if (!bots[server]) {
    // Asssign directly instead of awaiting, so that we can
    // ensure efficient re-use even when content handling and
    // prefetch are racing each other.
    bots[server] = makeBotClient(server, authObj);
  }
  return bots[server];
}

/**
 * @return {Promise} Map object
 */
function getWikiMap (authObj) {
  if (dMap) {
    return dMap;
  }
  dMap = (async function () {
    const client = await getBotClient('meta.wikimedia.org', authObj);

    return new Promise((resolve, reject) => {
      client.api.call({
        action: 'sitematrix',
        smlangprop: 'site',
        smsiteprop: 'url|dbname'
      }, function (err, sitematrix) {
        if (err) {
          reject(err);
          return;
        }
        const map = Object.create(null);
        for (const key in sitematrix) {
          if (key === 'count') {
            continue;
          }
          const group = key === 'specials' ? sitematrix[key] : sitematrix[key].site;
          if (group && group.length) {
            for (let i = 0; i < group.length; i++) {
              if (group[i].private === undefined &&
                group[i].closed === undefined &&
                group[i].nonglobal === undefined &&
                group[i].fishbowl === undefined
              ) {
                const wiki = group[i];
                wiki.server = new URL(wiki.url).host;
                map[wiki.dbname] = wiki;
                map[wiki.server] = wiki;
              }
            }
          }
        }
        resolve(map);
      });
    });
  }());
  return dMap;
}

function printHeading (pageName, wiki) {
  console.log('\n' + colors.bold.underline(pageName) + ' (%s)\n', wiki);
}
function reportNoop () {
  console.log('No major changes. Loading next subject...');
}
function failPage (err) {
  let message;
  if (err instanceof SkipFileError) {
    message = `Skipped (${err.message})`;
  } else {
    message = 'Failed. ' + (err.stack || err.toString()) + '\n';
  }
  console.log(`${message} Loading next subject...`);
}
function openPage (subject) {
  subject.opened = true;
  if (!subject.server) {
    console.log('Unable to find url for [[%s]]...', subject.pageName);
    return;
  }
  const url = 'https://' + subject.server + '/wiki/' + subject.pageName;
  console.log('Opening %s...', colors.bold.underline(url));
  opener(url);
}
function printApplyHelp () {
  const help = (
    'y - yes, accept this change\n' +
    'n - no, reject this change\n' +
    'a - accept all changes for this pattern in the current file\n' +
    'r - reject all changes for this pattern in the current file\n' +
    'e - edit the page in a web browser, and skip the rest of this file\n' +
    'o - open the page in a web browser for inspection, but keep the change undecided\n' +
    's - skip all remaining changes and patterns in this file\n' +
    'h - print help\n'
  );
  console.log(colors.red.bold(help));
}

async function confirmSaving (subject, summary, result) {
  const wiki = subject.server || subject.wiki;

  if (result.didSomeAllOrAuto) {
    console.log('\nEdit summary: %s\n', summary);
    await ask.options(
      'One or more proposed changes were applied automatically.' +
        '\nDo you want to save these changes on ' + colors.bold.underline(subject.pageName) + '?',
      {
        yes: function () {},
        no: function () {
          throw new SkipFileError();
        }
      }
    );
  }

  console.log('\nEdit summary: %s\nSaving edit on [[%s]] (%s)...', summary, colors.bold(subject.pageName), wiki);
}

async function handleContent (subject, content, siteinfo) {
  let shown = false;
  let didSomeAllOrAuto = false;
  // A reference to a pattern object for which the user
  // has indicated they want to automatically accept all
  // replacements in the current file content.
  let currentAllOfPattern = null;

  /**
   * Accepter callback for Fixer#run.
   *
   * @param {string[]} lines All lines of current file
   * @param {number} i Current line number
   * @param {string} line Current line (original)
   * @param {string} replacement Current line (proposed)
   * @param {Object} pattern A pattern object for reference
   * @return {boolean} Whether to accept the change
   */
  async function proposeChange (lines, i, line, replacement, pattern) {
    const contextSize = 5;
    const contextStart = Math.max(0, i - 5);
    const linesBefore = lines.slice(contextStart, i).join('\n');
    const linesAfter = lines.slice(i + 1, i + contextSize).join('\n');
    const diff = Diff.simpleDiff(line, replacement);
    console.log(Diff.formatDiff(diff, contextStart, linesBefore, linesAfter));
    // Save yes/no decisions in a cache for convenient re-use.
    // The significant serialisation of the change is similar to diffStr,
    // but *including* linesBefore+After, and *without* line numbers.
    const decideCacheKey = JSON.stringify([
      [linesBefore, linesAfter],
      [diff.textBefore, diff.removed, diff.added, diff.textAfter]
    ]);
    const decision = decisionCache.get(decideCacheKey);
    const decisionName = (decision !== undefined ? (decision ? 'Yes' : 'No') : null);
    function askApply () {
      let readTimeout;
      shown = true;
      if (currentAllOfPattern !== pattern) {
        // Different pattern, stop any all-replacement
        currentAllOfPattern = null;
      }

      if (currentAllOfPattern === pattern) {
        // Active all-replacement of a pattern, apply in 50ms.
        readTimeout = 50;
      } else if (decisionName) {
        // We've previously made a yes/no decision on a similar diff.
        // Assume the same response after 50ms.
        readTimeout = 50;
      }
      return ask.options('Apply change?', {
        timeout: readTimeout
      }, {
        yes: function () {
          decisionCache.set(decideCacheKey, true);
          return true;
        },
        no: function () {
          decisionCache.set(decideCacheKey, false);
          // Stop any all-replacement
          currentAllOfPattern = null;
        },
        all: function () {
          // Start all-replacement
          currentAllOfPattern = pattern;
          return true;
        },
        reject: function () {
          currentAllOfPattern = null;

          throw new SkipPatternError();
        },
        edit: function () {
          openPage(subject); // TODO: Test me, order changed
          throw new SkipFileError('Editing in browser');
        },
        open: async function () {
          openPage(subject);
          return await askApply();
        },
        skip: function () {
          throw new SkipFileError();
        },
        help: async function () {
          printApplyHelp();
          return await askApply();
        }
      });
    }
    try {
      return await askApply();
    } catch (err) {
      // Time-outs are used to communicate "all" and "auto" mode
      if (err && err.message === 'timed out') {
        if (argv.auto && decision !== undefined) {
          // Re-use cached decision in "auto" mode.
          console.log(decisionName + ' [assumed from decision cache]');
          didSomeAllOrAuto = true;
          return decision === true;
        } else if (currentAllOfPattern === pattern) {
          // Fix the same pattern blindly within a single file.
          console.log('[auto-accepted current pattern]');
          didSomeAllOrAuto = true;
          return true;
        }
      }

      // Re-throw as actual error
      throw err;
    }
  }

  await Content.checkSubject(subject, content, {
    quiet: true
  });
  const fix = new Fixer(content, patterns, siteinfo);
  const result = await fix.run(replace, proposeChange);
  return {
    ...result,
    shown,
    didSomeAllOrAuto
  };
}

async function checkAll (subject, content) {
  if (argv.all &&
    (!argv.contains || content.indexOf(argv.contains) !== -1) &&
    (!argv.match || new RegExp(argv.match).test(content)) &&
    !subject.opened
  ) {
    const answer = await ask.confirm('Open in browser?');
    if (answer) {
      openPage(subject);
    }
  }
}

async function prefetchSubject (authObj, map, subject) {
  const wiki = map[subject.wiki];
  if (!wiki) {
    return;
  }
  const client = await getBotClient(wiki.server, authObj);
  // Start pending promise and put into cache
  getPageCache.title = subject.pageName;
  getPageCache.server = wiki.server;
  getPageCache.promise = client.getPage(subject.pageName);
}

async function handleSubject (authObj, map, subject, preloadNext) {
  const wiki = map[subject.wiki];
  if (!wiki) {
    printHeading(subject.pageName, subject.wiki);
    throw new SkipFileError('Unknown wiki: ' + subject.wiki);
  }
  // Hack for printSaving() and openPage()
  subject.server = wiki.server;

  printHeading(subject.pageName, wiki.server);
  const client = await getBotClient(wiki.server, authObj);
  let page;
  if (getPageCache.server === wiki.server && getPageCache.title === subject.pageName) {
    page = await getPageCache.promise;
  } else {
    page = await client.getPage(subject.pageName);
  }
  const siteinfo = await client.siteinfo();
  // At this point, we've got everything for the current subject,
  // let's start preloading the next!
  preloadNext();
  let result;
  try {
    result = await handleContent(subject, page.revision.content, siteinfo);
  } catch (err) {
    // Before discarding, offer to "open" if needed
    await checkAll(subject, page.revision.content);
    throw err;
  }

  // Before saving, offer to "open" if needed
  await checkAll(subject, page.revision.content);

  const newContent = result.content;
  if (!result.summaries.length) {
    if (result.shown) {
      // Before skipping, offer to "open" if needed
      await checkAll(subject, page.revision.content);
      // No change made, or only minor cleanup
      reportNoop();
    }
    return;
  }

  await Content.checkSubject(subject, newContent);
  const summary = 'Maintenance: [[mw:RL/MGU]] - ' + result.summaries.join(', ');

  await confirmSaving(subject, summary, result);

  // Save edit
  await new Promise(function (resolve, reject) {
    client.edit(page, newContent, summary, function (err) {
      err ? reject(new SkipFileError(err.message)) : resolve(); // promisify
    });
  });
}

async function start (configFileDefault) {
  decisionCache = new DecisionStore({ enabled: argv.auto });
  let authObj;
  let map;
  let parsedResults;
  let i;
  function preloadNext () {
    const nextSubject = parsedResults[i + 1];
    if (nextSubject) {
      // Ignore async stack
      prefetchSubject(authObj, map, nextSubject);
    }
  }
  try {
    authObj = await auth.getAuth(argv.config || configFileDefault);
    console.log(colors.cyan('Reading %s'), path.resolve(argv.file));
    const results = fs.readFileSync(argv.file).toString();
    map = await getWikiMap(authObj);
    parsedResults = parseResults(results);
    for (i = 0; i < parsedResults.length; i++) {
      const subject = parsedResults[i];
      subject.opened = false;
      subject.ecmaVersion = null;
      try {
        await handleSubject(authObj, map, subject, preloadNext);
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

module.exports = function cli () {
  const configFileDefault = path.join(os.homedir(), '.config', 'tourbot', '.mwauth.json');
  if (argv.help) {
    console.log('Help for Tourbot v' + require('../package.json').version);
    console.log('  --config FILE        Where to store your credentials. Default: ' + configFileDefault);
    console.log('  -f, --file FILE      File that contains a list of pages to process. Default: results.txt');
    console.log('  -a, --all            Enable interactive mode for all page names, even without matches. Default: off');
    console.log('  -c, --contains TEXT  Limit the `all` iteration to pages that currently contain the given text.');
    console.log('  -m, --match TEXT     Similar to the `contains` parameter, but interpreted as a regular expression.');
    console.log('  -x, --auto           Enable remembering of decisions and re-apply them automatically to similar diffs. Default: off');
    console.log('  -v, --verbose        Enable debug logging. Default: off');
    console.log('  -h, --help           Show this help page, instead of running the tourbot.');
    return;
  }
  start(configFileDefault);
};
