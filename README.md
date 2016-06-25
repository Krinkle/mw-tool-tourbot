[![Build Status](https://travis-ci.org/Krinkle/mw-tool-tourbot.svg?branch=master)](https://travis-ci.org/Krinkle/mw-tool-tourbot)

# mw-tool-tourbot

## Usage

<img width="822" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16357409/1b93ac5e-3af6-11e6-8b38-41d8c6562d20.png">
<img width="490" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16091916/0c7536ba-3336-11e6-83cc-96d3964e3503.png">
<img width="594" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16357410/220259be-3af6-11e6-9479-c4205972e3bf.png">

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
