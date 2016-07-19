var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function FollowDao() {
    BaseDao.call(this);
};

util.inherits(FollowDao, BaseDao);

FollowDao.prototype.getFollowerById = function(id) {
    return this.executeReadQuery(
        'SELECT * FROM followers WHERE id = ?',
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

FollowDao.prototype.getFollower = function(userId, followerId) {
    return this.executeReadQuery(
        'SELECT * FROM followers WHERE userid = ? AND followerid = ?',
        [
            userId,
            followerId
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

FollowDao.prototype.getFollowers = function(userId, followerIds) {
    var ids = followerIds.join(',');
    return this.executeReadQuery(
        'SELECT * FROM followers WHERE userid = ? AND followerid IN (' + ids + ')',
        [
            userId
        ]
    );
};

FollowDao.prototype.getFollowersForUserId = function(userId, offset, limit) {
    var limitQuery = databaseUtils.getLimitForQuery(offset, limit);
    return this.executeReadQuery(
        'SELECT * FROM followers WHERE userid = ? LIMIT ' + limitQuery,
        [
            userId
        ]
    );
};

FollowDao.prototype.getTotalFollowersForUserId = function(userId) {
    return this.executeReadQuery(
        'SELECT COUNT(*) AS total FROM followers WHERE userid = ?',
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

FollowDao.prototype.getFollowingForUserId = function(userId, offset, limit) {
    var limitQuery = databaseUtils.getLimitForQuery(offset, limit);
    return this.executeReadQuery(
        'SELECT * FROM followers WHERE followerid = ? LIMIT ' + limitQuery,
        [
            userId
        ]
    );
};

FollowDao.prototype.getTotalFollowingForUserId = function(userId) {
    return this.executeReadQuery(
        'SELECT COUNT(*) AS total FROM followers WHERE followerid = ?',
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

FollowDao.prototype.addFollower = function(userId, followerId) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO followers SET ?',
        {
            userid: userId,
            followerid: followerId,
            followdate: dateUtils.getUTCDate().toDate()
        }
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error adding follower');
        },
        function onError(error) {
            deferred.reject('Error adding follower ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

FollowDao.prototype.removeFollower = function(userId, followerId) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'DELETE FROM followers WHERE userid = ? AND followerid = ?',
        [
            userId,
            followerId
        ]
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    removed: true
                });
            }
            deferred.reject('Unknown error deleting follower');
        },
        function onError(error) {
            deferred.reject('Error deleting follower ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

module.exports = new FollowDao();