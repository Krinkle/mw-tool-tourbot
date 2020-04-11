#!/usr/bin/env node

var path = require('path');
var os = require('os');
var cli = require('../src/cli');
var authDir = path.join(os.homedir(), '.config', 'tourbot');
cli(authDir);
