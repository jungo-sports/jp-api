var _ = require('lodash'),
    q = require('q'),
    Checkin = require('../models/checkin-model'),
    CheckinDao = require('../persistence/checkin/checkin-dao'),
    EventService = require('./event-service');

function CheckinService() {};

CheckinService.prototype.getCheckinById = function(id) {
    return CheckinDao.getCheckinById(id);
};

CheckinService.prototype.getCheckinsByUserId = function(userId, offset, limit) {
    return q.all(
        [
            CheckinDao.getCheckinsForUser(userId, offset, limit),
            CheckinDao.getTotalCheckinsForUser(userId)
        ]
    )
    .then(
        function onSuccess(data) {
            return {
                total: data[1] || 0,
                checkins: _.map(data[0] || [], function(checkin) {
                    try {
                        checkin.extra = JSON.parse(checkin.extra);
                    } catch (e) {
                        // ...
                    }
                    if (!checkin.extra) {
                        checkin.extra = {};
                    }
                    checkin = _(checkin).omitBy(_.isNull).value();
                    return new Checkin(checkin);
                })
            }
        }
    )
};

CheckinService.prototype.addCheckinEvent = function(userId, type, extra) {
    extra = (extra instanceof Object) ? extra : {};
    if ((!extra.longitude || !extra.latitude) && !extra.name) {
        var deferred = q.defer();
        deferred.reject('Either longitude and latitude, or name is required');
        return deferred.promise;
    }
    if (extra.extra) {
        extra.extra = JSON.stringify(extra.extra);
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