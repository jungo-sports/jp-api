var pubsub = require('pubsub-js'),
    EventTypes = require('../models/event-types-model');

function EventService() {
    this.keys = EventTypes.types;
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

module.exports = new EventService();