[![Build Status](https://travis-ci.org/Krinkle/mw-tool-tourbot.svg?branch=master)](https://travis-ci.org/Krinkle/mw-tool-tourbot)

# mw-tool-tourbot

## Usage

<img width="822" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16357409/1b93ac5e-3af6-11e6-8b38-41d8c6562d20.png">
<img width="490" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16091916/0c7536ba-3336-11e6-83cc-96d3964e3503.png">
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
