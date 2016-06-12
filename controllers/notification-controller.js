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
    this.registerGetMethod('/user/id/:userid', this.getNotificationsByUserId)
};

NotificationController.prototype.getNotificationsByUserId = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        offset = request.query.offset || 0,
        limit = request.query.limit || 20;
    NotificationService.getNotificationsByUserId(userId, offset, limit)
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
};

NotificationController.prototype.init = function() {
    NotificationController.super_.prototype.init.call(this);
    this.registerEventListeners();
};

module.exports = NotificationController;