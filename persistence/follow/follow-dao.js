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