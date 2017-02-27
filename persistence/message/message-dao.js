var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils');

function Dao() {
    BaseDao.call(this);
}

util.inherits(Dao, BaseDao);

Dao.prototype.addMessage = function(fromUser, toUser, message, date) {
    var deferred = q.defer();
    this.executeWriteQuery(
            'INSERT INTO messages SET ?',
            {
                fromuser: fromUser,
                touser: toUser,
                message: message,
                date: date
            }
        )
        .then(
            function onSuccess(data) {
                if (data && data.affectedRows) {
                    return deferred.resolve({
                        id: data.insertId
                    });
                }
                deferred.reject('Unknown error adding message');
            },
            function onError(error) {
                deferred.reject('Error adding message ' + databaseUtils.getErrorByCode(error.code));
            }
        );
    return deferred.promise;
};

Dao.prototype.getMessageById = function(id) {
    return this.executeReadQuery(
            'SELECT * FROM messages WHERE id = ?',
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

Dao.prototype.getMessageThreadsByUserId = function(userId, offset, limit) {
    return this.executeReadQuery(
        'SELECT m.* FROM messages_threads t, messages m WHERE (t.fromuser = ? OR t.touser = ?) AND t.latestmessage = m.id ORDER BY t.latestmessagedate DESC LIMIT ?, ?',
        [
            userId,
            userId,
            offset,
            limit
        ]
    );
};

Dao.prototype.getTotalMessageThreadsByUserId = function(userId) {
    return this.executeReadQuery(
            'SELECT COUNT(*) AS total FROM messages_threads WHERE fromuser = ? OR touser = ? ',
            [
                userId,
                userId
            ]
        )
        .then(
            function onSuccess(data) {
                if (!data || data.length === 0) {
                    return 0;
                }
                return parseInt(data[0].total) || 0;
            }
        );
};

Dao.prototype.getMessageThreadForUsers = function(fromUser, toUser) {
    return this.executeReadQuery(
            'SELECT * FROM messages_threads WHERE (fromuser = ? AND touser = ?) OR (touser = ? AND fromuser = ?)',
            [
                fromUser,
                toUser,
                fromUser,
                toUser,
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

Dao.prototype.getMessagesForUsers = function(fromUser, toUser, offset, limit) {
    return this.executeReadQuery(
            'SELECT * FROM messages WHERE (fromuser = ? AND touser = ?) OR (touser = ? AND fromuser = ?) ORDER BY date DESC LIMIT ?, ?',
            [
                fromUser,
                toUser,
                fromUser,
                toUser,
                offset,
                limit
            ]
        );
};

Dao.prototype.getTotalMessagesForUsers = function(fromUser, toUser) {
    return this.executeReadQuery(
            'SELECT COUNT(*) AS total FROM messages WHERE (fromuser = ? AND touser = ?) OR (touser = ? AND fromuser = ?)',
            [
                fromUser,
                toUser,
                fromUser,
                toUser
            ]
        )
        .then(
            function onSuccess(data) {
                if (!data || data.length === 0) {
                    return 0;
                }
                return parseInt(data[0].total) || 0;
            }
        );
};

Dao.prototype.updateLatestMessageThreadById = function(id, latestMessageId, latestMessageDate) {
    return this.executeWriteQuery(
        'UPDATE messages_threads SET ? WHERE id = ?',
        [
            {
                latestmessage: latestMessageId,
                latestmessagedate: latestMessageDate
            },
            id
        ]
    );
};

Dao.prototype.deleteMessageThreadById = function(id) {
    return this.executeWriteQuery(
        'DELETE FROM messages_threads WHERE id = ?',
        [
            id
        ]
    )
};

Dao.prototype.addMessageThread = function(fromUser, toUser, latestMessageId, latestMessageDate) {
    var deferred = q.defer();
    this.executeWriteQuery(
            'INSERT INTO messages_threads SET ?',
            {
                fromuser: fromUser,
                touser: toUser,
                latestmessage: latestMessageId,
                latestmessagedate: latestMessageDate
            }
        )
        .then(
            function onSuccess(data) {
                if (data && data.affectedRows) {
                    return deferred.resolve({
                        id: data.insertId
                    });
                }
                deferred.reject('Unknown error adding message thread');
            },
            function onError(error) {
                deferred.reject('Error adding message thread ' + databaseUtils.getErrorByCode(error.code));
            }
        );
    return deferred.promise;
};

Dao.prototype.deleteMessageById = function(id) {
    return this.executeWriteQuery(
        'DELETE FROM messages WHERE id = ?',
        [
            id
        ]
    )
};

module.exports = new Dao();