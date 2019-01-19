var util = require('util');

function SkipFileError (message) {
  this.name = 'SkipFileError';
  this.message = message || '';
  Error.captureStackTrace(this, SkipFileError);
}
util.inherits(SkipFileError, Error);

function SkipPatternError (message) {
  this.name = 'SkipPatternError';
  this.message = message || '';
  Error.captureStackTrace(this, SkipPatternError);
}
util.inherits(SkipPatternError, Error);

function AbortError (message) {
  this.name = 'AbortError';
  this.message = message || '';
  Error.captureStackTrace(this, AbortError);
}
util.inherits(AbortError, Error);

module.exports = { SkipFileError, SkipPatternError, AbortError };
