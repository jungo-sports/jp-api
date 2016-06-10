var q = require('q'),
    util = require('util'),
    BaseEventDistributor = require('./base-event-distributor');

function EventDistributor() {
    BaseEventDistributor.call(this);
    this.type = this.eventTypes.FOLLOW_ADD;
    this.service = this.getService('follow-service');
};

util.inherits(EventDistributor, BaseEventDistributor);

EventDistributor.prototype.getUserNotificationsDistribution = function(event) {
    var deferred = q.defer();
    this.service.getFollowerById(event.entity)
        .then(
            function onSuccess(data) {
                if (!data || !data.userid) {
                    return deferred.resolve([]);
                }
                return deferred.resolve([data.userid]);
            }
        );
    return deferred.promise;
};

module.exports = EventDistributor;