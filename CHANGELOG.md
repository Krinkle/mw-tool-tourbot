## Tag v2.2.0

* patterns: Change edit summary for "jQuery 3" swaps to mention [T280944](https://phabricator.wikimedia.org/T280944).
* patterns: Improve swap for modules names to understand `@requires` comments.
* patterns: Improve swap for `removeAttr()` to cover all Sizzle bool attribs.
* patterns: Improve swap for `$j`.

## Tag v2.1.0

* cli: Add `--config` option to change where credentials are stored.
* cli: Add automatic changing of user preference to `pst-cssjs=0` if needed, for [T236828](https://phabricator.wikimedia.org/T236828).
* content: Add support for parsing ES6+ user scripts.
* content: Enable `<nowiki>` balance protection on CSS pages.
* patterns: Add swap for `$.parseJSON()`.
* patterns: Add swap for `mediawiki.page.startup` module.
* patterns: Add swap that removes `mediawiki.notify` from certain file comments.
* patterns: Fix swap for `wgIsMainPage` to support negated checks.
* patterns: Improve swaps for `mediawiki.notify`.

## v2.0.0

Require Node 10+.

* cli: Add support for global-search JSON file format.
* cli: Improve handleContent errors by including stack traces.
* cli: Remove hardcoded skip for "MediaWiki:Gadget-popups.js" pages.
* content: Add support for Wikimedia Incubator's "Gadgets-definition" subpages.
* content: Refuse editing pages that have unclosed `<nowiki>` tags.
* diff: Fix `+ ` alignment in a multi-line replacement.
* paterns: Remove swap for changing index.php query parameter order.
* patterns: Add swap for `jquery.ui` aliases.
* patterns: Add swap for `mediawiki.RegExp` module.
* patterns: Add swap for `mw.config.exists('wgEnableAPI')`.
* patterns: Add swap for `user.tokens` "editToken" to "csrfToken".
* patterns: Add swap for `wgEnableAPI` and `wgEnableWriteAPI`. (DannyS712)
* patterns: Add swap for `wgMonthNamesShort[index]`.
* patterns: Add swap for localised `wgMonthNamesShort`.
* patterns: Add swap from `jquery.accessKeyLabel` to `mediawiki.util`. (Alex Monk)
* patterns: Add swap from `jquery.effects.core` to `jquery.ui`.
* patterns: Add swap to remove `mediawiki.legacy.wikibits` dep.
* patterns: Add swap to remove `mediawiki.notify`.
* patterns: Fix swap for `wgEnableAPI` to support negated use.
* patterns: Improve swap for `mediawiki.legacy.wikibits`.
* patterns: Improve swap for `wgEnableAPI` to support use with `typeof` operator.
* patterns: Improve swaps for modules names to also change certain file comments.
* patterns: Improve swaps for various mw.util merges.
* patterns: Remove swap for `&maxage=` and `&smaxage=` params.
* patterns: Remove swap for `importScriptURI`.
* patterns: Remove swap for removing `json` module (too unstable).
* patterns: Remove swap that changed `.charAt()`.
* patterns: Remove swap that changed `mw.config.values` use.

## v1.9.0

* patterns: Add swap for `andSelf()` to `addBack()`.
* patterns: Add swap for global `wgMainPageTitle`.
* patterns: Change order of some swaps.
* patterns: Fix swap for `action=json`.
* patterns: Fix swap for module name to ignore partial in-word matches.

## v1.8.0

* cli: Add `r` answer to change propt, to reject all instances of this pattern.
* cli: Fix JS syntax check to ignore "MediaWiki:Gadgets-definition" pages.
* cli: Remove `--quick-skip` option, now always on.
* patterns: Add support for Gadgets-definition pages in module swaps.
* patterns: Improve swap for `ext.wikiEditor` module.
* patterns: Improve swap for `jquery.byteLimit` module.

## v1.7.0

Require Node 8+.

* cli: Fix usage information for `--xt` option.
* patterns: Add swaps for various removed and renamed RL modules.
* patterns: Document caveat of `mw.notify` dependency.
* patterns: Improve swap for removing `mediawiki.api.*` aliases.

## v1.5.1

* build: Reduce package size by explicitly setting `files` in package.json.

## v1.5.0

* patterns: Add swap to remove es5-shim.

## v1.4.0

* content: Fix end-of-script error rendering as "undefined".
* patterns: Add swap for wgScriptExtension.

## v1.3.0

* cli: Add `--quick-skip` option.
* cli: Add `-auto` (`x`) option for automatic decision caching and re-use.
* cli: Change edit summary to no longer mention `[[mw:RL/JD]]`.
* cli: Faster loading of subjects by preloading next subject in the background.
* diff: Add two spaces in front of context lines to improve alignment.
* patterns: Add swap for deprecated `mw.user` methods.
* patterns: Add swap to remove `bcache=1` query parameter.
* patterns: Change swaps to insert HTTPS urls instead of protocol-relative.
* patterns: Improve swaps for "skins-1.5" urls.
* patterns: Promote swap for `maxage` removal from minor to major.

## v1.2.0

* cli: Internal refactor to use async/await.
* patterns: Add swap to remove known-broken JS code from `window.popup` user scripts.

## v1.1.0

Remove Node 6 support, require Node 7+.

* cli: Implement `--verbose` (`-v`) debug logger.
* fixer: Change interaction to prompt for each replacement within a line separately.
* patterns: Change most swaps to match-one instead of match-all.

## v1.0.0

* cli: Add `--help` option. (Alex Monk)
* cli: Skip file if you get an error while editing. (Alex Monk)
* cli: Make all subject handling failures non-fatal.
* patterns: Add swap for `.size()`. (Alex Monk)
* patterns: Add swap for `.removeAttr()` boolean deprecated calls. (Alex Monk)

## v0.9.3

* patterns: Add swap for common wgScript/wgPageName purge urls.
* patterns: Add swap from non-mw.config wgPageName to wgIsMainPage.
* patterns: Add swap from wgPageName to wgIsMainPage.

## v0.9.0

* cli: Improve usability of change diff proposals.
* patterns: Add swap common wgScript/wgPageName/uselang pattern.
* patterns: Add swap for luxo/contributions toolserver url.
* patterns: Add swap for magnus/fist.php toolserver url.
* patterns: Add swap for toolserver WikiSense/Contributors url.

## v0.8.0

Remove support for Node 4, require Node 6+.

* cli: Fix crash when a listed page no longer exists.
* cli: Fix JS syntax-check to ignore `.css` pages.
* patterns: Add swap for legacy "skins-1.5" and "skins/monobook" paths.
* patterns: Add swap to adopt `wgIsMainPage` (based on siteinfo API).
* patterns: Add swap to change `Map.values` to `Map.get()`, incl via `mw.user`.
* patterns: Fix swaps to ignore `DatRoot.addOnloadHook`.
* patterns: Fix swaps to ignore `pg.escapeQuotesHTML`.
* patterns: Improve swap for `Map.values` on case like `$.each(..values, fn)`.

## v0.7.0

* patterns: Add minor swap to replace `charAt(0)` with `[0]`.
* patterns: Add swap for `$.trimLeft` and `$.trimRight`.
* patterns: Add swap from `mw.config.values` to `mw.config.get`.
* patterns: Add swap to load Wdsearch.js from en.wikipedia.org.
* patterns: Prefer `/w/` over `/static/current/` as default.

## v0.6.0

* cli: Change `--all` to not ask for opening if already opened.

## v0.5.0

* patterns: Add swap for bits.wikimedia.org/skins-1.5/ urls.
* patterns: Add swap for bits.wikimedia.org/static-$version/ urls.
* patterns: Add swap for load.php from bits.wikimedia.org to local.
* patterns: Add swap to normalise `action=raw` query parameter order.
* patterns: Add swap to remove old wgStyleVersion query strings.

## v0.4.0

* patterns: Add swap for bits.wikimedia.org.
* patterns: Fix swap for HTTPS and protocol-relative Toolserver URL.

## v0.3.0

* cli: Add `--all` option to prompt opening even if no patterns matched.

## v0.2.1

* ask: Fix for readline interrupt errors.
* auth: Store in home directory instead of in module installation.
* cli: Add `--file` option for custom path to results.txt.
* cli: Add code context for checkScript() errors.
* cli: Add syntax validation check before saving.
