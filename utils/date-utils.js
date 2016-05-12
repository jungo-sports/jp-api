var moment = require('moment');

function DateUtils() {};

DateUtils.prototype.getUTCDate = function(date) {
    return moment.utc(date);
};

module.exports = new DateUtils();