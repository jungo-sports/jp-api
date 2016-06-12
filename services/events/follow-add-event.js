var q = require('q'),
    util = require('util'),
    BaseEvent = require('./base-event');

function Event() {
    BaseEvent.call(this);
    this.type = this.eventTypes.FOLLOW_ADD;
    this.followService = this.getService('follow-service');
    this.userService = this.getService('user-service');
};

util.inherits(Event, BaseEvent);

Event.prototype.getUserNotificationsDistribution = function(event) {
    var deferred = q.defer();
    this.followService.getFollowerById(event.entity)
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

Event.prototype.getActionForEvent = function(event) {
    var _this = this,
        deferred = q.defer(),
        followEvent = {};
    this.followService.getFollowerById(event.entity)
        .then(
            function onSuccess(data) {
                if (!data || !data.userid) {
                    return deferred.resolve(followEvent);
                }
                followEvent = data;
                return q.all(
                    [
                        _this.userService.getUserById(data.userid),
                        _this.userService.getUserById(data.followerid)
                    ]
                );
            }
        )
        .then(
            function onSuccess(data) {
                var Follow = _this.getModel('follow-model');

                // Passing in the full user, no need for their IDs in the root
                // object anymore
                followEvent.userid = undefined;
                followEvent.followerid = undefined;
                followEvent.user = data[0];
                followEvent.follower = data[1];

                deferred.resolve(new Follow(followEvent));
            }
        );
    return deferred.promise;
};

module.exports = Event;