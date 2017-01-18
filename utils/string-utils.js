var randtoken = require('rand-token'),
    slug = require('slug');

function StringUtils() {}

StringUtils.prototype.getRandomToken = function(length) {
    return randtoken.generate(length || 16);
};

StringUtils.prototype.getSlug = function(term, blacklisted) {
    var cleaned = slug(term);
    blacklisted = blacklisted || [];
    blacklisted.forEach(function(key) {
        cleaned = cleaned.replace(key, '');
    });
    return cleaned;
};

module.exports = new StringUtils();