var q = require('q'),
    dateUtils = require('../utils/date-utils'),
    messageDao = require('../persistence/message/message-dao'),
    userService = require('./user-service');

function Service() {}

Service.prototype.addMessage = function(fromUserId, toUserId, message) {
    var _this = this,
        insertedMessageId,
        date = dateUtils.getUTCDate().toDate();
    return messageDao.addMessage(fromUserId, toUserId, message, date)
        .then(
            function onSuccess(data) {
                if (!data || !data.id) {
                    throw new Error('Error adding message');
                }
                insertedMessageId = data.id;
                return messageDao.getMessageThreadForUsers(fromUserId, toUserId);
            }
        )
        .then(
            function onSuccess(data) {
                if (!data || !data.id) {
                    return messageDao.addMessageThread(fromUserId, toUserId, insertedMessageId, date);
                }
                return messageDao.updateLatestMessageThreadById(data.id, insertedMessageId, date);
            }
        )
        .then(
            function onSuccess(data) {
                return _this.getMessageById(insertedMessageId);
            }
        );
};

Service.prototype.getMessageThreadsByUserId = function(userId, offset, limit) {
    var messages;
    return q.all(
            [
                messageDao.getTotalMessageThreadsByUserId(userId),
                messageDao.getMessageThreadsByUserId(userId, offset, limit)
            ]
        )
        .then(
            function onSuccess(data) {
                messages = {
                    total: data[0] || 0,
                    messages: data[1] || []
                };
                if (messages.messages.length > 0) {
                    var userIds = [];
                    messages.messages.forEach(function(message) {
                        userIds.push(message.fromuser);
                        userIds.push(message.touser);
                    });
                    return userService.getUsersByIds(userIds);
                }
                return {};
            }
        )
        .then(
            function onSuccess(data) {
                messages.messages.forEach(function(message) {
                    message.fromuser = data[message.fromuser];
                    message.touser = data[message.touser];
                });
                return messages;
            }
        );
};

Service.prototype.getMessagesForUsers = function(fromUser, toUser, offset, limit) {
    var messages;
    return q.all(
            [
                messageDao.getTotalMessagesForUsers(fromUser, toUser),
                messageDao.getMessagesForUsers(fromUser, toUser, offset, limit)
            ]
        )
        .then(
            function onSuccess(data) {
                messages = {
                    total: data[0] || 0,
                    messages: data[1] || []
                };
                return userService.getUsersByIds([fromUser, toUser]);
            }
        )
        .then(
            function onSuccess(data) {
                messages.messages.forEach(function(message) {
                    message.fromuser = data[message.fromuser];
                    message.touser = data[message.touser];
                });
                return messages;
            }
        );
};

Service.prototype.getMessageById = function(id) {
    var message;
    return messageDao.getMessageById(id)
        .then(
            function onSuccess(data) {
                if (!data || !data.id) {
                    throw new Error('No message found');
                }
                message = data;
                return userService.getUsersByIds([data.fromuser, data.touser]);
            }
        )
        .then(
            function onSuccess(data) {
                message.fromuser = data[message.fromuser];
                message.touser = data[message.touser];
                return message;
            }
        );
};



Service.prototype.deleteMessageById = function(id) {
    var _this = this,
        messageToDelete,
        date = dateUtils.getUTCDate().toDate();
    return this.getMessageById(id)
        .then(
            function onSuccess(data) {
                if (!data || !data.id) {
                    throw new Error('No message found');
                }
                messageToDelete = data;
                return _this.getMessagesForUsers(data.fromuser.id, data.touser.id, 0, 2);
            }
        )
        .then(
            function onSuccess(data) {
                if (data.total <= 1) {
                    // ...delete thread
                    return messageDao.getMessageThreadForUsers(messageToDelete.fromuser.id, messageToDelete.touser.id)
                        .then(
                            function onSuccess(data) {
                                return messageDao.deleteMessageThreadById(data.id);
                            }
                        )
                } else {
                    // ...get latest message and update
                    var lastMessage = data.messages[0],
                        nextMessage = data.messages[1];
                    if ((lastMessage.id + '') === (id + '')) {
                        return messageDao.getMessageThreadForUsers(messageToDelete.fromuser.id, messageToDelete.touser.id)
                            .then(
                                function onSuccess(data) {
                                    return messageDao.updateLatestMessageThreadById(data.id, nextMessage.id, date);
                                }
                            );
                    }
                }
                return data;
            }
        )
        .then(
            function onSuccess(data) {
                return messageDao.deleteMessageById(id);
            }
        )
        .then(
            function onSuccess(data) {
                return {
                    success: true
                }
            }
        );
};

module.exports = new Service();