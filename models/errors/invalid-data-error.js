var util = require('util');

function InvalidDataError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};

module.exports = InvalidDataError;

util.inherits(module.exports, Error);