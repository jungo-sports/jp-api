var q = require('q'),
    EventTypes = require('../../models/event-types-model');

function EventMap() {};

EventMap.prototype.getEventForType = function(type) {
    var event,
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
    
    if (!event) {
        deferred.reject('No event found matching type ' + type);
        return deferred.promise;
    }

    deferred.resolve(
        new (require('./' + event))()
    );
    return deferred.promise;
};

module.exports = new EventMap();