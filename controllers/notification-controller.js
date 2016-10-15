var util = require('util'),
    BaseController = require('./base-controller'),
    EventService = require('../services/event-service'),
    NotificationService = require('../services/notification-service'),
    NotificationEvent = require('../models/notification-event-model'),
    EventTypes = require('../models/event-types-model');

function NotificationController(app) {
    if (!(this instanceof NotificationController)) {
        return new NotificationController(app);
    }
    BaseController.call(this, app, {
        path: '/notifications'
    });
};

util.inherits(NotificationController, BaseController);

NotificationController.prototype.registerAllMethods = function() {

    this.registerGetMethod('/user/id/:userid', this.getNotificationsByUserId);

    this.registerPostMethod('/user/id/:userid/read', this.setAllNotificationsAsRead);
};

NotificationController.prototype.getNotificationsByUserId = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        offset = parseInt(request.query.offset || 0),
        limit = parseInt(request.query.limit || 20),
        types = (request.query.types) ? request.query.types.split(',') : undefined;
    NotificationService.getNotificationsByUserId(userId, offset, limit, types)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting notifications'
                });
            }
        );
};

NotificationController.prototype.setAllNotificationsAsRead = function(request, response) {
    var _this = this,
        userId = request.params.userid;
    NotificationService.setAllNotificationsAsRead(userId)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error setting notifications as read'
                });
            }
        );
};

NotificationController.prototype.registerEventListeners = function() {
    EventService.subscribeToEvent(EventService.keys.FOLLOW_ADD, function onFollowAdd(data) {
        EventService.addEvent(
            new NotificationEvent({
                type: EventTypes.types.FOLLOW_ADD,
                entity: data.id
            })
        );
    });

    EventService.subscribeToEvent(EventService.keys.FOLLOW_REMOVE, function onFollowRemove(data) {
        EventService.removeEvent(
            new NotificationEvent({
                type: EventTypes.types.FOLLOW_ADD,
                entity: data.id
            })
        );
    });

    EventService.subscribeToEvent(EventService.keys.CHECKIN_ADD, function onCheckinAdd(data) {
        EventService.addEvent(
            new NotificationEvent({
                type: EventTypes.types.CHECKIN_ADD,
                entity: data.id
            })
        );
    });

    EventService.subscribeToEvent(EventService.keys.FRIEND_REQUEST, function onFriendAdd(data) {
        EventService.addEvent(
            new NotificationEvent({
                type: EventTypes.types.FRIEND_REQUEST,
                entity: data.id
            })
        );
    });

    EventService.subscribeToEvent(EventService.keys.FRIEND_REMOVE, function onFriendRemove(data) {
        EventService.removeEvent(
            new NotificationEvent({
                type: EventTypes.types.FRIEND_REQUEST,
                entity: data.id
            })
        );
        EventService.removeEvent(
            new NotificationEvent({
                type: EventTypes.types.FRIEND_APPROVE,
                entity: data.id
            })
        );
    });

    EventService.subscribeToEvent(EventService.keys.FRIEND_APPROVE, function onFriendAdd(data) {
        EventService.removeEvent(
            new NotificationEvent({
                type: EventTypes.types.FRIEND_REQUEST,
                entity: data.id
            })
        );
    });

    EventService.subscribeToEvent(EventService.keys.POKE_ADD, function onPokeAdd(data) {
        EventService.addEvent(
            new NotificationEvent({
                type: EventTypes.types.POKE_ADD,
                entity: data.id
            })
        );
    });
};

NotificationController.prototype.init = function() {
    NotificationController.super_.prototype.init.call(this);
    this.registerEventListeners();
};

module.exports = NotificationController;