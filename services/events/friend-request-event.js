var q = require('q'),
    util = require('util'),
    BaseEvent = require('./base-event');

function Event() {
    BaseEvent.call(this);
    this.type = this.eventTypes.FRIEND_REQUEST;
    this.friendService = this.getService('friend-service');
    this.userService = this.getService('user-service');
};

util.inherits(Event, BaseEvent);

Event.prototype.getUserNotificationsDistribution = function(event) {
    var deferred = q.defer();
    this.friendService.getFriendById(event.entity)
        .then(
            function onSuccess(data) {
                if (!data || !data.friendid) {
                    return deferred.resolve([]);
                }
                return deferred.resolve([data.friendid]);
            }
        );
    return deferred.promise;
};

Event.prototype.getActionForEvent = function(event) {
    var _this = this,
        deferred = q.defer(),
        friendEvent = {};
    this.friendService.getFriendById(event.entity)
        .then(
            function onSuccess(data) {
                if (!data || !data.userid) {
                    return deferred.resolve(friendEvent);
                }
                friendEvent = data;
                return q.all(
                    [
                        _this.userService.getUserById(data.userid),
                        _this.userService.getUserById(data.friendid)
                    ]
                );
            }
        )
        .then(
            function onSuccess(data) {
                var Friend = _this.getModel('friend-model');

                // Passing in the full user, no need for their IDs in the root
                // object anymore
                friendEvent.userid = undefined;
                friendEvent.friendid = undefined;
                friendEvent.user = data[0];
                friendEvent.friend = data[1];

                deferred.resolve(new Friend(friendEvent));
            }
        );
    return deferred.promise;
};

module.exports = Event;