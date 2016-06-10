var q = require('q');

function NotificationService() {};

NotificationService.prototype.distributeEvent = function(event) {
    var deferred = q.defer();
    if (!EventDistribution.shouldDistributeToFeed(event)) {
        deferred.resolve('Event not permitted for distribution');
        return deferred.promise;
    }
    deferred.resolve(true);
    return deferred.promise;
};

module.exports = new NotificationService();