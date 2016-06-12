var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function Dao() {
    BaseDao.call(this);
};

util.inherits(Dao, BaseDao);

Dao.prototype.addFeedEvent = function(userId, eventId) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO feeds SET ?',
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
            deferred.reject('Unknown error adding feed event');
        },
        function onError(error) {
            deferred.reject('Error adding feed event ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

Dao.prototype.getFeedEvents = function(userId, offset, limit) {
    return this.executeReadQuery(
        'SELECT * FROM feeds WHERE userid = ? ORDER BY createddate DESC LIMIT ?, ?',
        [
            userId,
            offset,
            limit
        ]
    )
};

Dao.prototype.getTotalFeedEvents = function(userId) {
    return this.executeReadQuery(
        'SELECT COUNT(*) AS total FROM feeds, events WHERE userid = ? AND events.id = feeds.eventid',
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

module.exports = new Dao();