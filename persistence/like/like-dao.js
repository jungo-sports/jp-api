var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function Dao() {
    BaseDao.call(this);
};

util.inherits(Dao, BaseDao);

Dao.prototype.addLike = function(userId, type, entity) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO likes SET ? ON DUPLICATE KEY UPDATE `date` = VALUES(`date`)',
        {
            userid: userId,
            type: type,
            entity: entity,
            date: dateUtils.getUTCDate().toDate()
        }
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error creating like');
        },
        function onError(error) {
            deferred.reject('Error creating like ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

Dao.prototype.removeLike = function(userId, type, entity) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'DELETE FROM likes WHERE userid = ? AND type = ? AND entity = ?',
        [
            userId,
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
            deferred.reject('Unknown error deleting like');
        },
        function onError(error) {
            deferred.reject('Error deleting like ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

Dao.prototype.getLikesForUserAndType = function(userId, type, offset, limit) {
    var limitQuery = databaseUtils.getLimitForQuery(offset, limit);
    return this.executeReadQuery(
        'SELECT * FROM likes WHERE userid = ? AND type = ? ORDER BY date DESC LIMIT ' + limitQuery,
        [
            userId,
            type
        ]
    );
};

Dao.prototype.getLikeForUserAndEntity = function(userId, type, entity) {
    return this.executeReadQuery(
        'SELECT * FROM likes WHERE userid = ? AND type = ? AND entity = ?',
        [
            userId,
            type,
            entity
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return undefined;
            }
            return data[0];
        }
    );;
};

Dao.prototype.getTotalLikesForUserAndType = function(userId, type) {
    return this.executeReadQuery(
        'SELECT COUNT(*) AS total FROM likes WHERE userid = ? AND type = ?',
        [
            userId,
            type
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