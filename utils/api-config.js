var config = require('config');

function Configuration() {};

Configuration.prototype.get = function(key) {
    return config.get(key);
};

module.exports = new Configuration();