var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function NotificationDao() {
    BaseDao.call(this);
};

util.inherits(NotificationDao, BaseDao);

NotificationDao.prototype.addEvent = function(type, entity, extra) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO notifications_events SET ?',
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
            deferred.reject('Unknown error adding notification event');
        },
        function onError(error) {
            deferred.reject('Error adding notification event ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

NotificationDao.prototype.removeEvent = function(type, entity) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'DELETE FROM notifications_events WHERE type = ? AND entity = ?',
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
            deferred.reject('Unknown error deleting notification event');
        },
        function onError(error) {
            deferred.reject('Error deleting notification event ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

module.exports = new NotificationDao();