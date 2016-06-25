[![Build Status](https://travis-ci.org/Krinkle/mw-tool-tourbot.svg?branch=master)](https://travis-ci.org/Krinkle/mw-tool-tourbot)

# mw-tool-tourbot

## Usage

<img width="763" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16357275/32c26540-3af2-11e6-91bd-b9e749e00c2f.png">
<img width="536" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16345134/95b3582e-3a40-11e6-805c-e097cd02d1b8.png">
<img width="490" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16091916/0c7536ba-3336-11e6-83cc-96d3964e3503.png">


## Install

Install the [npm](https://npmjs.org/) package:

```
npm install mw-tool-tourbot
```

To start the interactive process, run the `tourbot` program.
Pass parameters like `tourbot --file path/to/results.txt`.


### Options

* `--file results.txt` - File containing mwgrep results in the below format.

results.txt example:

```
## Public wiki results
nowiki              MediaWiki:Common.js/numarticles.js
pcdwiki             MediaWiki:Common.js
pdcwiki             MediaWiki:Common.js
```

mwgrep example:

```
$ mwgrep addOnloadHook  --max-results 1500 | grep 'Common'  > results.txt
```

### Development

Alternatively, install from Git:

```
git clone https://github.com/Krinkle/mw-tool-tourbot.git
````

Manually run `npm install`. To start the interactive process here, run `npm start`.
Pass parameters like `npm start -- --file path/to/results.txt`.

### See also
* https://github.com/he7d3r/mw-gadget-jsUpdater
