[![Build Status](https://travis-ci.org/Krinkle/mw-tool-tourbot.svg?branch=master)](https://travis-ci.org/Krinkle/mw-tool-tourbot)

# tourbot

### Usage


<img width="737" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16345133/959acc3c-3a40-11e6-9acb-5a71c6f786b8.png">
<img width="536" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16345134/95b3582e-3a40-11e6-805c-e097cd02d1b8.png">
<img width="490" alt="screen shot" src="https://cloud.githubusercontent.com/assets/156867/16091916/0c7536ba-3336-11e6-83cc-96d3964e3503.png">


### Install

Install the [npm](https://npmjs.org/) package:

```
npm install mw-tool-tourbot
```

Or `git clone https://github.com/Krinkle/mw-tool-tourbot.git` and run `npm install`

Configure the tool:

* `results.txt` - File containing mwgrep results in the below format.
* `.mwauth.json` - Login credentials for your account, use [Special:BotPasswords](https://en.wikipedia.org/wiki/Special:BotPasswords). Either create it manually as `{ "botname": "", "botpass": "" }`, or follow the interactive instructions and the file will be created automatically.

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

### See also
* https://github.com/he7d3r/mw-gadget-jsUpdater
