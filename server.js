var cli = require('./src/cli');
var path = require('path');
var authDir = path.join(require('user-home'), '.config', 'tourbot');
cli(authDir);
