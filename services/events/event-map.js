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