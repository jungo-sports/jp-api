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

Dao.prototype.getCheckinsForUser = function(userId, offset, limit) {
    return this.executeReadQuery(
        'SELECT * FROM checkins WHERE userid = ? ORDER BY startdate DESC LIMIT ?, ?',
        [
            userId,
            offset,
            limit
        ]
    )
};

Dao.prototype.getTotalCheckinsForUser = function(userId) {
    return this.executeReadQuery(
        'SELECT COUNT(id) AS total FROM checkins WHERE userid = ?',
        [
            userId
        ]
    )
    .then(
        function onSuccess(data) {
            data = (data instanceof Array) ? data : [];
            if (data.length > 0) {
                data = data[0];
            }
            return data.total || 0;
        }
    );
};

Dao.prototype.getUpcomingCheckinsForUser = function(userId, offset, limit) {
    return this.executeReadQuery(
        'SELECT * FROM checkins WHERE userid = ? AND startdate > ? ORDER BY startdate ASC LIMIT ?, ?',
        [
            userId,
            dateUtils.getUTCDate().toDate(),
            offset,
            limit
        ]
    )
};

Dao.prototype.getTotalUpcomingCheckinsForUser = function(userId) {
    return this.executeReadQuery(
            'SELECT COUNT(id) AS total FROM checkins WHERE userid = ? AND startdate > ?',
            [
                userId,
                dateUtils.getUTCDate().toDate()
            ]
        )
        .then(
            function onSuccess(data) {
                data = (data instanceof Array) ? data : [];
                if (data.length > 0) {
                    data = data[0];
                }
                return data.total || 0;
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
    if (extra.startdate) {
        parameters.startdate = extra.startdate;
    } else {
        parameters.startdate = dateUtils.getUTCDate().toDate()
    }
    if (extra.enddate) {
        parameters.enddate = extra.enddate;
    } else {
        parameters.enddate = dateUtils.getUTCDate().toDate()
    }
    if (extra.extra) {
        parameters.extra = extra.extra;
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

Dao.prototype.updateCheckinEvent = function(id, type, extra) {
    var deferred = q.defer(),
        parameters = {
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
    if (extra.startdate) {
        parameters.startdate = extra.startdate;
    } else {
        parameters.startdate = dateUtils.getUTCDate().toDate()
    }
    if (extra.enddate) {
        parameters.enddate = extra.enddate;
    } else {
        parameters.enddate = dateUtils.getUTCDate().toDate()
    }
    if (extra.extra) {
        parameters.extra = extra.extra;
    }
    this.executeWriteQuery(
            'UPDATE checkins SET ? WHERE id = ?',
            [
                parameters,
                id
            ]
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

Dao.prototype.deleteCheckinEvent = function(id) {
    return this.executeWriteQuery(
        'DELETE FROM checkins WHERE id = ?',
        [
            id
        ]
    );
};

module.exports = new Dao();