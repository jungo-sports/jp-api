var _ = require('lodash'),
    User = require('./user-model');

function UserList(users, total) {
    users = (users instanceof Array) ? users : [];
    return {
        users: _.map(users, function(value) {
            return new User(value);
        }),
        total: total || 0
    };
};

module.exports = UserList;