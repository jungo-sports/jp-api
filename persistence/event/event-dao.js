var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function EventDao() {
    BaseDao.call(this);
};

util.inherits(EventDao, BaseDao);

EventDao.prototype.getEventById = function(id) {
    return this.executeReadQuery(
        'SELECT * FROM events WHERE id = ?',
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

EventDao.prototype.addEvent = function(type, entity, extra) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO events SET ?',
        {
            type: type,
            entity: entity,
            extra: extra,
            createddate: dateUtils.getUTCDate().toDate()
        }
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error adding event');
        },
        function onError(error) {
            deferred.reject('Error adding event ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

EventDao.prototype.removeEvent = function(type, entity) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'DELETE FROM events WHERE type = ? AND entity = ?',
        [
            type,
            entity
        ]
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    removed: true
                });
            }
            deferred.reject('Unknown error deleting event');
        },
        function onError(error) {
            deferred.reject('Error deleting event ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

module.exports = new EventDao();