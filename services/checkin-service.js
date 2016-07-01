var q = require('q'),
    Checkin = require('../models/checkin-model'),
    CheckinDao = require('../persistence/checkin/checkin-dao'),
    EventService = require('./event-service');

function CheckinService() {};

CheckinService.prototype.getCheckinById = function(id) {
    return CheckinDao.getCheckinById(id);
};

CheckinService.prototype.addCheckinEvent = function(userId, type, extra) {
    extra = (extra instanceof Object) ? extra : {};
    if ((!extra.longitude || !extra.latitude) && !extra.name) {
        var deferred = q.defer();
        deferred.reject('Either longitude and latitude, or name is required');
        return deferred.promise;
    }
    return CheckinDao.addCheckinEvent(userId, type, extra)
        .then(
            function onSuccess(data) {
                return CheckinDao.getCheckinById(data.id);
            }
        )
        .then(
            function onSuccess(data) {
                EventService.publishEvent(EventService.keys.CHECKIN_ADD, new Checkin(data));
                return data;
            }
        );
};

module.exports = new CheckinService();