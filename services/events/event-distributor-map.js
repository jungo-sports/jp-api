var q = require('q'),
    EventTypes = require('../../models/event-types-model');

function EventDistributorMap() {};

EventDistributorMap.prototype.getDistributorForType = function(type) {
    var distributor,
        deferred = q.defer();
    switch(type) {
        case EventTypes.types.FOLLOW_ADD:
            distributor = 'follow-add-event-distributor';
            break;
        default:
            break;
    }
    
    if (!distributor) {
        deferred.reject('No distributor found matching type ' + type);
        return deferred.promise;
    }

    deferred.resolve(
        new (require('./distributors/' + distributor))()
    );
    return deferred.promise;
};

module.exports = new EventDistributorMap();