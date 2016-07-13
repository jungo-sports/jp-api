var _ = require('lodash'),
    q = require('q'),
    FriendList = require('../models/friend-list-model'),
    FriendDao = require('../persistence/friend/friend-dao'),
    UserService = require('./user-service');

function FriendService() {};

FriendService.prototype.getIsUserFriend = function(userId, friendId) {
    return FriendDao.isFriend(userId, friendId);
};

FriendService.prototype.getIsUserFriendsList = function(userId, friendIds) {
    return FriendDao.isFriendList(userId, friendIds)
        .then(
            function onSuccess(data) {
                var friends = {};
                _.forEach(friendIds, function(friendId) {
                    var friend = _.find(data, function(user) {
                        return (user.userid === friendId) || (user.friendid === friendId);
                    });
                    friends[friendId] = (friend !== undefined);
                });
                return friends;
            }
        );
};

FriendService.prototype.getFriendsByUserId = function(userId, offset, limit) {
    var friendsList = {};

    userId = parseInt(userId);

    return q.all(
        [
            FriendDao.getFriendsByUserId(userId, offset, limit),
            FriendDao.getPendingFriendRequestsByUserId(userId, 0, 25),
            FriendDao.getTotalFriendsByUserId(userId),
            FriendDao.getTotalPendingFriendsByUserId(userId)
        ]
    )
    .then(
        function onSuccess(data) {
            friendsList = {
                friends: data[0],
                pendingFriends: data[1],
                totalFriends: data[2],
                totalPendingFriends: data[3]
            };
            var userIds = _.map(friendsList.friends, function(friend) {
                return friend.friendid;
            });
            userIds = userIds.concat(_.map(friendsList.friends, function(friend) {
                return friend.userid;
            }));
            userIds = userIds.concat(_.map(friendsList.pendingFriends, function(friend) {
                return friend.friendid;
            }));
            userIds = userIds.concat(_.map(friendsList.pendingFriends, function(friend) {
                return friend.userid;
            }));

            if (userIds.length > 0) {
                return UserService.getUsersByIds(userIds);
            }

            return new FriendList(
                friendsList.friends,
                friendsList.pendingFriends,
                friendsList.totalFriends,
                friendsList.totalPendingFriends
            );
        }
    )
    .then(
        function onSuccess(data) {
            _.forEach(friendsList.friends, function(friend) {
                if (friend.friendid !== userId) {
                    friend.friend = data[friend.friendid];
                } else {
                    friend.friend = data[friend.userid];
                }
            });
            _.forEach(friendsList.pendingFriends, function(friend) {
                if (friend.friendid !== userId) {
                    friend.friend = data[friend.friendid];
                } else {
                    friend.friend = data[friend.userid];
                }
            });
            return new FriendList(
                friendsList.friends,
                friendsList.pendingFriends,
                friendsList.totalFriends,
                friendsList.totalPendingFriends
            );
        }
    );
};

module.exports = new FriendService();