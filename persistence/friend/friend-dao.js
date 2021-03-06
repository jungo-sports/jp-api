var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function Dao() {
    BaseDao.call(this);
};

util.inherits(Dao, BaseDao);

Dao.prototype.getFriendById = function(id) {
    return this.executeReadQuery(
        'SELECT * FROM friends WHERE id = ?',
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

Dao.prototype.deleteFriendById = function(id) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'DELETE FROM friends WHERE id = ?',
        [
            id
        ]
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    removed: true
                });
            }
            deferred.reject('Unknown error deleting friend');
        },
        function onError(error) {
            deferred.reject('Error deleting friend ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

Dao.prototype.getFriendsByUserId = function(userId, offset, limit) {
    return this.executeReadQuery(
        'SELECT * FROM friends WHERE (userid = ? OR friendid = ?) AND status = \'accepted\' ORDER BY accepteddate DESC LIMIT ?,?',
        [
            userId,
            userId,
            offset,
            limit
        ]
    )
};

Dao.prototype.getTotalFriendsByUserId = function(userId) {
    return this.executeReadQuery(
        'SELECT COUNT(id) AS total FROM friends WHERE (userid = ? OR friendid = ?) AND status = "accepted"',
        [
            userId,
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

Dao.prototype.getPendingFriendRequestsByUserId = function(userId, offset, limit) {
    return this.executeReadQuery(
        'SELECT * FROM friends WHERE friendid = ? AND status = \'pending\' ORDER BY requesteddate DESC LIMIT ?,?',
        [
            userId,
            offset,
            limit
        ]
    )
};

Dao.prototype.getTotalPendingFriendsByUserId = function(userId) {
    return this.executeReadQuery(
        'SELECT COUNT(id) AS total FROM friends WHERE friendid = ? AND status = "pending"',
        [
            userId,
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

Dao.prototype.isFriend = function(userId, friendId) {
    return this.executeReadQuery(
        'SELECT * FROM friends WHERE ((userid = ? AND friendid = ?) OR (userid = ? AND friendid = ?)) AND status = \'accepted\'',
        [
            userId,
            friendId,
            friendId,
            userId
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return false;
            }
            return true;
        }
    );
};

Dao.prototype.isFriendList = function(userId, friendIds) {
    var ids = friendIds.join(',');
    return this.executeReadQuery(
        'SELECT * FROM friends WHERE ((userid = ? AND friendid IN (' + ids + ')) OR (userid IN (' + ids + ')) AND friendid = ?) AND status = \'accepted\'',
        [
            userId,
            userId
        ]
    );
};

Dao.prototype.isPendingFriendRequest = function(userId, friendId) {
    return this.executeReadQuery(
        'SELECT * FROM friends WHERE userid = ? AND friendid = ? AND status = \'pending\'',
        [
            userId,
            friendId
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return false;
            }
            return true;
        }
    );
};

Dao.prototype.addFriendRequest = function(userId, friendId) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO friends SET ?',
        {
            userid: userId,
            friendid: friendId,
            status: 'pending',
            requesteddate: dateUtils.getUTCDate().toDate()
        }
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error adding friend request');
        },
        function onError(error) {
            deferred.reject('Error adding friend request ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

Dao.prototype.acceptFriendRequest = function(userId, friendId) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'UPDATE friends SET ? WHERE userid = ? AND friendid = ?',
        [
            {
                status: 'accepted',
                accepteddate: dateUtils.getUTCDate().toDate()
            },
            userId,
            friendId
        ]
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    accepted: true
                });
            }
            deferred.reject('Unknown error accepting friend');
        },
        function onError(error) {
            deferred.reject('Error accepting friend ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

Dao.prototype.declineFriendRequest = function(userId, friendId) {
    return this.executeWriteQuery(
        'UPDATE friends SET ? WHERE userid = ? AND friendid = ?',
        [
            {
                status: 'declined'
            },
            userId,
            friendId
        ]
    )
    .then(
        function onSuccess(data) {
            return {
                removed: (data && data.affectedRows) ? true : false
            }
        }
    );
};

Dao.prototype.getFriendRequest = function(userId, friendId) {
    return this.executeReadQuery(
        'SELECT * FROM friends WHERE (userid = ? AND friendid = ?) OR (userid = ? AND friendid = ?) ORDER BY id DESC',
        [
            userId,
            friendId,
            friendId,
            userId
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return {};
            }
            return data[0];
        }
    );
};

module.exports = new Dao();