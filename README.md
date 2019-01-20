[![Build Status](https://travis-ci.org/Krinkle/mw-tool-tourbot.svg?branch=master)](https://travis-ci.org/Krinkle/mw-tool-tourbot)

# mw-tool-tourbot

## Usage

<img height="327" alt="Screen shot" src="https://cloud.githubusercontent.com/assets/156867/24174412/b148335c-0e4d-11e7-9ef4-ada243de1fe7.png">
<img height="298" alt="" src="https://user-images.githubusercontent.com/156867/51370710-d4e53900-1aac-11e9-9359-6f5f0af7671e.png">
<img height="122" alt="" src="https://cloud.githubusercontent.com/assets/156867/24174411/b14480c2-0e4d-11e7-8fcb-1c794d22f310.png">
<img height="140" alt="" src="https://cloud.githubusercontent.com/assets/156867/16357410/220259be-3af6-11e6-9479-c4205972e3bf.png">

## Getting started

Install the [npm](https://npmjs.org/) package:

```
npm install -g mw-tool-tourbot
```

To start the interactive process, run the `tourbot` program.
Pass parameters like `tourbot --file path/to/results.txt`.

## Options

* `--file FILE`: File that contains a list of pages to process. Default: results.txt
* `--all:` Enable interactive mode for all page names, even without matches.
* `--contains TEXT`: Limit the `all` iteration to pages that currently contain the given text.
* `--match TEXT`: Similar to the `contains` parameter, but interpreted as a regular expression.
* `--auto`: Enable remembering of decisions and re-apply them automatically to similar diffs. Default: off.
* `--help`: Show the help page, instead of running the tourbot.

## Automation

Once you're comfortable with the basics of Tourbot, there is a great deal
of automation you can enable.

Note: If one or more proposed changes on a given file were accepted
through automation, Tourbot will **always** ask for final confirmation
before publishing the edit to the wiki. This basically allows you to
monitor the automation in real-time without being delayed by keyboard
interaction. Then, once done, you can scan through it if desired, and
then either accept it all, or cancel the edit.

* **Decision reuse**

  When enabling the `--auto` option (short: `-x`), Tourbot will remember
  your Yes/No decision for a proposed change (for the lifetime of the current
  process).

  Then, when the same line-replacement with the same 5 lines of context
  is encounted another time (e.g. in another file, on another wiki),
  it will automatically assume the same decision.

* **Accept all changes** (per pattern, per file)

  When you encounter a change, such as replacing `$j` with `$`, where it is
  likely that there are many of these throughout the file, but all slightly
  different. Then, `--auto` might not help much. Instead, you could use
  the "a" (Accept all) response, instead of a regular "y" (Yes).

  In "Accept all" mode, Tourbot will accept all instances of the current
  pattern over the current file. After that, it will continue as normal
  for the remaining patterns (not auto-accepted).
  If there are no further replacement suggestions, it will wait for your
  final confirmation, to give you a chance to review the auto-accepted
  changes.

* **Reject all** (per pattern, per file)

  When you encounter a proposed change you prefer not to apply, you can
  choose "n" (No) to reject the change. For example, because the pattern
  is falsely matching, or because the change might be unsafe. If a pattern
  has lots of matches like this in the single file, use "r" (Reject all) to
  skip this pattern, and continue with another.

## Example

The input file for Tourbot follow the output format used by [`mwgrep`](https://wikitech.wikimedia.org/wiki/Wikimedia_binaries#mwgrep), which has on each line a pair of (wiki-id, pagename). For example:

```
testwiki            MediaWiki:Gadgets-definition
test2wiki           MediaWiki:Gadget-teahouse/content.js
```

I sometimes publish search results as [a Gist](https://gist.github.com/Krinkle/a18e726fc3af30f30bf9b2ba919820b5). These can be used, like so:

```
$ curl -O -L 'https://gist.github.com/Krinkle/a18e726fc3af30f30bf9b2ba919820b5/raw/c8c72d371c80c701eb4f6f5422c6ac51c6264f1f/mwgrep.escapeRE.txt

$ tourbot -f mwgrep.escapeRE.txt

 Reading /Users/krinkle/Downloads/mwgrep.mwCustomEditButtons.txt

 [..]
```

## Contributing

Install from Git:

```
git clone https://github.com/Krinkle/mw-tool-tourbot.git
````

Manually run `npm install`. To start the interactive process, run `./bin/tourbot.js`.
Pass parameters like `./bin/tourbot.js -- --file path/to/results.txt`.

Alternatively, run `npm link` to create a global symlink for `tourbot`.

## See also

* https://github.com/he7d3r/mw-gadget-jsUpdater
