var q = require('q'),
    FB = require('fb');

function Service() {}

Service.prototype.getUserByAccessToken = function(accessToken) {
    var deferred = q.defer();
    FB.setAccessToken(accessToken);
    FB.api('/me', function(response) {
        if (response && response.error) {
            return deferred.reject(response.error);
        }
        deferred.resolve(response);
    });
    return deferred.promise;
};

module.exports = new Service();