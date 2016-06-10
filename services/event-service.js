var _ = require('lodash'),
    q = require('q'),
    pubsub = require('pubsub-js'),
    EventTypes = require('../models/event-types-model'),
    EventDistribution = require('../models/event-distribution-model'),
    EventDistributorMap = require('./events/event-distributor-map'),
    EventDao = require('../persistence/event/event-dao'),
    NotificationDao = require('../persistence/notification/notification-dao'),
    FeedDao = require('../persistence/feed/feed-dao'),
    NotificationService = require('./notification-service'),
    FeedService = require('./feed-service');

function EventService() {
    this.keys = EventTypes.types;
};

function __distributeEventToType(type, event) {
    var deferred = q.defer();
    EventDistributorMap.getDistributorForType(event.type)
        .then(
            function onSuccess(distributor) {
                if (!distributor) {
                    return deferred.resolve(true);
                }
                var method = (type === 'feed') ? 'getUserFeedDistribution' : 'getUserNotificationsDistribution';
                return distributor[method](event);
            },
            function onError(error) {
                deferred.resolve(false);
            }
        )
        .then(
            function onSuccess(data) {
                if (!data || data.length === 0) {
                    return;
                }
                var insertMethods = _.map(data, function(userId) {
                    if (type === 'feed') {
                        return FeedDao.addFeedEvent(userId, event.id);
                    } else {
                        return NotificationDao.addNotificationEvent(userId, event.id);
                    }
                });
                return q.all(insertMethods);
            }
        );
    return deferred.promise;
};

EventService.prototype.publishEvent = function(key, value) {
    pubsub.publish(key, value);
};

EventService.prototype.subscribeToEvent = function(key, callback) {
    pubsub.subscribe(key, function onEvent(message, data) {
        if ((callback instanceof Function)) {
            callback(data);
        }
    });
};

EventService.prototype.addEvent = function(event) {
    var _this = this;
    return EventDao.addEvent(event.type, event.entity, event.extra)
        .then(
            function onSuccess(data) {
                if (data && data.id) {
                    return EventDao.getEventById(data.id);
                }
                return data;
            }
        )
        .then(
            function onSuccess(data) {
                return _this.distributeEvent(data);
            }
        );
};

EventService.prototype.removeEvent = function(event) {
    return EventDao.removeEvent(event.type, event.entity);
};

EventService.prototype.distributeEvent = function(event) {
    return q.all(
        [
            __distributeEventToType('feed', event),
            __distributeEventToType('notifications', event)
        ]
    );
};

module.exports = new EventService();