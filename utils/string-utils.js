var randtoken = require('rand-token');

function StringUtils() {};

StringUtils.prototype.getRandomToken = function(length) {
    return randtoken.generate(length || 16);
};

module.exports = new StringUtils();