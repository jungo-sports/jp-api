var _ = require('lodash'),
    q = require('q'),
    EventDistribution = require('../models/event-distribution-model'),
    FeedDao = require('../persistence/feed/feed-dao'),
    EventService = require('./event-service'),
    FeedListModel = require('../models/feed-list-model');

function FeedService() {};

FeedService.prototype.getFeedByUserId = function(userId, offset, limit) {
    var events = [],
        notifications = [];
    return FeedDao.getFeedEvents(userId, offset, limit)
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
                return FeedDao.getTotalFeedEvents(userId);
            }
        )
        .then(
            function onSuccess(data) {
                return new FeedListModel({
                    events: events,
                    total: data,
                });
            }
        );
};

module.exports = new FeedService();