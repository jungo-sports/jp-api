var _ = require('lodash'),
    Follow = require('./follow-model');

function FollowList(follows, total) {
    follows = (follows instanceof Array) ? follows : [];
    return {
        follows: _.map(follows, function(value) {
            return new Follow(value);
        }),
        total: total || 0
    };
};

module.exports = FollowList;