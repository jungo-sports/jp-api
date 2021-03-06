var _ = require('lodash'),
    q = require('q'),
    NotificationDao = require('../persistence/notification/notification-dao'),
    EventService = require('./event-service'),
    NotificationListModel = require('../models/notification-list-model'),
    EventTypes = require('../models/event-types-model');

function NotificationService() {};

NotificationService.prototype.getNotificationsByUserId = function(userId, offset, limit, types) {
    var events = [],
        notifications = [];

    if (!types) {
        types = _.values(EventTypes.types);
    }
    return NotificationDao.getNotifications(userId, offset, limit, types)
        .then(
            function onSuccess(data) {
                if (!data || data.length === 0) {
                    return [];
                }
                notifications = data;
                return EventService.getEventsByIds(_.map(data, 'eventid'));
            }
        )
        .then(
            function onSuccess(data) {
                events = data.map(function(event) {
                    var notification = _.find(notifications, { eventid: event.event.id })
                    if (notification) {
                        event.unread = (notification.unread) ? true : false;
                    } else {
                        event.unread = false;
                    }
                    event.notificationId = notification.id;
                    return event;
                });
                return q.all(
                    [
                        NotificationDao.getTotalNotifications(userId, types),
                        NotificationDao.getTotalUnreadNotifications(userId, types)
                    ]
                );
            }
        )
        .then(
            function onSuccess(data) {
                return new NotificationListModel({
                    events: events,
                    total: data[0],
                    unread: data[1]
                });
            }
        );
};

NotificationService.prototype.setAllNotificationsAsRead = function(userId) {
    return NotificationDao.setAllNotificationsAsRead(userId);
};

NotificationService.prototype.deleteNotificationById = function(id) {
    return NotificationDao.deleteNotificationById(id);
};

module.exports = new NotificationService();