var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function Dao() {
    BaseDao.call(this);
};

util.inherits(Dao, BaseDao);

Dao.prototype.addNotificationEvent = function(userId, eventId) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO notifications SET ?',
        {
            userid: userId,
            eventid: eventId,
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
            deferred.reject('Unknown error adding notification');
        },
        function onError(error) {
            deferred.reject('Error adding notification ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

Dao.prototype.getNotifications = function(userId, offset, limit) {
    return this.executeReadQuery(
        'SELECT * FROM notifications WHERE userid = ? ORDER BY createddate DESC LIMIT ?, ?',
        [
            userId,
            offset,
            limit
        ]
    )
};

Dao.prototype.getTotalNotifications = function(userId) {
    return this.executeReadQuery(
        'SELECT COUNT(*) AS total FROM notifications, events WHERE userid = ? AND events.id = notifications.eventid',
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

Dao.prototype.getTotalUnreadNotifications = function(userId) {
    return this.executeReadQuery(
        'SELECT COUNT(*) AS total FROM notifications, events WHERE userid = ? AND UNREAD = ? AND events.id = notifications.eventid',
        [
            userId,
            true
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

module.exports = new Dao();