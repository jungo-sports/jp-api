var _ = require('lodash'),
    Friend = require('./friend-model');

function Model(friends, pendingFriends, totalFriends, totalPendingFriends) {
    friends = (friends instanceof Array) ? friends : [];
    pendingFriends = (pendingFriends instanceof Array) ? pendingFriends : [];
    return {
        friends: _.map(friends, function(value) {
            return new Friend(value);
        }),
        pendingFriends: _.map(pendingFriends, function(value) {
            return new Friend(value);
        }),
        totalFriends: parseInt(totalFriends) || 0,
        totalPendingFriends: parseInt(totalPendingFriends) || 0
    };
};

module.exports = Model;