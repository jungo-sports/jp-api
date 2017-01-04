var randtoken = require('rand-token'),
    slug = require('slug');

function StringUtils() {}

StringUtils.prototype.getRandomToken = function(length) {
    return randtoken.generate(length || 16);
};

StringUtils.prototype.getSlug = function(term) {
    return slug(term);
};

module.exports = new StringUtils();