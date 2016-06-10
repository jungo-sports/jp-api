var q = require('q'),
    EventDistribution = require('../models/event-distribution-model');

function FeedService() {};

FeedService.prototype.distributeEvent = function(event) {
    var deferred = q.defer();
    if (!EventDistribution.shouldDistributeToFeed(event)) {
        deferred.resolve('Event not permitted for distribution');
        return deferred.promise;
    }
    deferred.resolve(true);
    return deferred.promise;
};

module.exports = new FeedService();