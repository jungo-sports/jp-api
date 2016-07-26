var util = require('util');

function DuplicateEntryError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};

module.exports = DuplicateEntryError;

util.inherits(module.exports, Error);