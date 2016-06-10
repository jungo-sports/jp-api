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
        path: '/notification'
    });
};

util.inherits(NotificationController, BaseController);

NotificationController.prototype.registerAllMethods = function() {

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