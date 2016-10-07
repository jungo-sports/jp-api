var q = require('q'),
    EventTypes = require('../../models/event-types-model');

function EventMap() {
    this.externalEvents = {};
};

EventMap.prototype.registerExternalEvent = function(type, method) {
    this.externalEvents[type] = method;
};

EventMap.prototype.getEventForType = function(type) {
    var event,
        external = false,
        deferred = q.defer();
    switch(type) {
        case EventTypes.types.FOLLOW_ADD:
            event = 'follow-add-event';
            break;
        case EventTypes.types.CHECKIN_ADD:
            event = 'checkin-add-event';
            break;
        case EventTypes.types.FRIEND_REQUEST:
            event = 'friend-request-event';
            break;
        case EventTypes.types.FRIEND_APPROVE:
            event = 'friend-approve-event';
            break;
        case EventTypes.types.POKE_ADD:
            event = 'poke-add-event';
            break;
        default:
            break;
    }

    // If no internal event was found, try looking in the externally registered
    // events next.
    if (!event) {
        event = this.externalEvents[type];
        if (event) {
            external = true;
        }
    }
    
    if (!event) {
        deferred.reject('No event found matching type ' + type);
        return deferred.promise;
    }

    if (!external) {
        deferred.resolve(
            new (require('./' + event))()
        );
    } else {
        deferred.resolve(event);
    }
 
    return deferred.promise;
};

module.exports = new EventMap();