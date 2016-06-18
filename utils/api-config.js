var config = require('config');

function Configuration() {};

Configuration.prototype.get = function(key) {
    return config.get(key);
};

Configuration.prototype.has = function(key) {
    return config.has(key);
};

module.exports = new Configuration();