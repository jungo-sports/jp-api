var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function Dao() {
    BaseDao.call(this);
};

util.inherits(Dao, BaseDao);

Dao.prototype.getCheckinById = function(id) {
    return this.executeReadQuery(
        'SELECT * FROM checkins WHERE id = ?',
        [
            id
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return undefined;
            }
            return data[0];
        }
    );
};

Dao.prototype.addCheckinEvent = function(userId, type, extra) {
    var deferred = q.defer(),
        parameters = {
            userid: userId,
            type: type
        };
    extra = (extra instanceof Object) ? extra : {};
    if (extra.longitude) {
        parameters.longitude = extra.longitude;
    }
    if (extra.latitude) {
        parameters.latitude = extra.latitude;
    }
    if (extra.name) {
        parameters.name = extra.name;
    }
    if (extra.description) {
        parameters.description = extra.description;
    }
    if (extra.date) {
        parameters.date = extra.date;
    } else {
        parameters.date = dateUtils.getUTCDate().toDate()
    }
    this.executeWriteQuery(
        'INSERT INTO checkins SET ?',
        parameters
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error adding checkin event');
        },
        function onError(error) {
            deferred.reject('Error adding checkin event ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

module.exports = new Dao();