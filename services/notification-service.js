var _ = require('lodash'),
    q = require('q'),
    NotificationDao = require('../persistence/notification/notification-dao'),
    EventService = require('./event-service'),
    NotificationListModel = require('../models/notification-list-model');

function NotificationService() {};

NotificationService.prototype.getNotificationsByUserId = function(userId, offset, limit) {
    var events = [],
        notifications = [];
    return NotificationDao.getNotifications(userId, offset, limit)
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
                events = data;
                return q.all(
                    [
                        NotificationDao.getTotalNotifications(userId),
                        NotificationDao.getTotalUnreadNotifications(userId)
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

module.exports = new NotificationService();