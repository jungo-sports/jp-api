var q = require('q'),
    util = require('util'),
    BaseEvent = require('./base-event');

function Event() {
    BaseEvent.call(this);
    this.type = this.eventTypes.CHECKIN_ADD;
    this.checkinService = this.getService('checkin-service');
    this.userService = this.getService('user-service');
};

util.inherits(Event, BaseEvent);

Event.prototype.getUserFeedDistribution = function(event) {
    var deferred = q.defer();
    this.checkinService.getCheckinById(event.entity)
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
        checkinEvent = {};

    this.checkinService.getCheckinById(event.entity)
        .then(
            function onSuccess(data) {
                if (!data || !data.userid) {
                    return deferred.resolve(checkinEvent);
                }
                checkinEvent = data;
                return _this.userService.getUserById(data.userid);
            }
        )
        .then(
            function onSuccess(data) {
                var Checkin = _this.getModel('checkin-model');
                checkinEvent.user = data;
                deferred.resolve(new Checkin(checkinEvent));
            }
        );
    return deferred.promise;
};

module.exports = Event;