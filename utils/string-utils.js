var randtoken = require('rand-token'),
    slug = require('slug');

function StringUtils() {}

StringUtils.prototype.getRandomToken = function(length) {
    return randtoken.generate(length || 16);
};

StringUtils.prototype.getSlug = function(term, blacklisted) {
    var slug = slug(term);
    blacklisted = blacklisted || [];
    blacklisted.forEach(function(key) {
        slug = slug.replace(key, '');
    });
    return slug;
};

module.exports = new StringUtils();