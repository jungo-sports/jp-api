var _ = require('lodash'),
    q = require('q'),
    pubsub = require('pubsub-js'),
    EventTypes = require('../models/event-types-model'),
    EventDistribution = require('../models/event-distribution-model'),
    EventMap = require('./events/event-map'),
    EventDao = require('../persistence/event/event-dao'),
    NotificationDao = require('../persistence/notification/notification-dao'),
    NotificationEventAction = require('../models/notification-event-action-model'),
    FeedDao = require('../persistence/feed/feed-dao');

function EventService() {
    this.keys = EventTypes.types;
};

function __distributeEventToType(type, event) {
    var deferred = q.defer();
    EventMap.getEventForType(event.type)
        .then(
            function onSuccess(distributor) {
                if (!distributor) {
                    return deferred.resolve(true);
                }
                var method = (type === 'feed') ? 'getUserFeedDistribution' : 'getUserNotificationsDistribution',
                    clonedEvent = _.cloneDeep(event);

                if (clonedEvent.extra) {
                    try {
                        clonedEvent.extra = JSON.parse(clonedEvent.extra);
                    } catch (e) {
                        console.warn('Unable to parse JSON for extra event data', clonedEvent.extra);
                    }
                }
                return distributor[method](clonedEvent);
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
        )
        .catch(
            function onError(error) {
                console.error(error);
            }
        );
    return deferred.promise;
};

function __getActionsForEvent(event) {
    var deferred = q.defer();
    EventMap.getEventForType(event.type)
        .then(
            function onSuccess(distributor) {
                if (!distributor) {
                    return deferred.resolve(true);
                }
                var clonedEvent = _.cloneDeep(event);
                if (clonedEvent.extra) {
                    try {
                        clonedEvent.extra = JSON.parse(clonedEvent.extra);
                    } catch (e) {
                        console.warn('Unable to parse JSON for extra event data', clonedEvent.extra);
                    }
                }
                return distributor['getActionForEvent'](clonedEvent);
            }
        )
        .then(
            function onSuccess(data) {
                deferred.resolve(
                    new NotificationEventAction({
                        event: event,
                        action: data
                    })
                );
            }
        )
        .catch(
            function onError(error) {
                console.error('Error getting action for event', event, error);
                deferred.resolve({});
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
    if (event.extra && (event.extra instanceof Object)) {
        event.extra = JSON.stringify(event.extra);
    }
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

EventService.prototype.getEventsByIds = function(ids) {
    return EventDao.getEventsByIds(ids)
        .then(
            function onSuccess(data) {
                return q.all(
                    _.map(data, function(event) {
                        return __getActionsForEvent(event);
                    })
                );
            }
        )
        .then(
            function onSuccess(data) {
                return _.sortBy(data, function(event) {
                    return event.event.createddate;
                }).reverse();
            }
        );
};

module.exports = new EventService();