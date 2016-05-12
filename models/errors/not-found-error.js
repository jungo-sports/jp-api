var util = require('util');

function NotFoundError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
};

module.exports = NotFoundError;

util.inherits(module.exports, Error);