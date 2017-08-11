[![Build Status](https://travis-ci.org/Krinkle/mw-tool-tourbot.svg?branch=master)](https://travis-ci.org/Krinkle/mw-tool-tourbot)

# mw-tool-tourbot

## Usage

<img width="668" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/24174412/b148335c-0e4d-11e7-9ef4-ada243de1fe7.png">
<img width="589" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/24174411/b14480c2-0e4d-11e7-8fcb-1c794d22f310.png">
<img width="594" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16357410/220259be-3af6-11e6-9479-c4205972e3bf.png">

## Quick start

Install the [npm](https://npmjs.org/) package:

```
npm install -g mw-tool-tourbot
```

To start the interactive process, run the `tourbot` program.
Pass parameters like `tourbot --file path/to/results.txt`.


### Options

* `--file results.txt` - File containing pairs of (wiki dbname, page name) in mwgrep output format.
* `--all` - Iterate over all page names, even if no tourbot patterns match on this page. Set this
  to use tourbot as a convenient way to create urls for each result and open them in a web browser.
* `--contains` - Limit the `all` iteration to pages that currently contain a particular phrase.
  This is especially useful when multiple people are working on the same list.
* `--matches` - Like `contains`, but interpreted as a regular expression.
* `--help` - Show the help page.

[Public results](https://gist.github.com/Krinkle/a18e726fc3af30f30bf9b2ba919820b5).


### Example

```
curl -O -L 'https://gist.github.com/Krinkle/a18e726fc3af30f30bf9b2ba919820b5/raw/mwgrep.mwCustomEditButtons.txt'
tourbot -f mwgrep.mwCustomEditButtons.txt -a -c 'mwCustomEditButtons'

 Reading /Users/krinkle/Downloads/mwgrep.mwCustomEditButtons.txt

 MediaWiki:Editpage.js (ab.wikipedia.org)

 Open in browser? (yes/no) y
 Opening https://ab.wikipedia.org/wiki/MediaWiki:Editpage.js...
```


### Development

Install from Git:

```
git clone https://github.com/Krinkle/mw-tool-tourbot.git
````

Manually run `npm install`. To start the interactive process, run `./bin/tourbot.js`.
Pass parameters like `./bin/tourbot.js -- --file path/to/results.txt`.

Alternatively, run `npm link` to create a global symlink for `tourbot`.

### See also
* https://github.com/he7d3r/mw-gadget-jsUpdater
