var _ = require('lodash'),
    User = require('./user-model');

function Model(data) {
    data = (data instanceof Object) ? data : {};

    var friend = _({
        id: data.id,
        userid: data.userid,
        friendid: data.friendid,
        status: data.status,
        requesteddate: data.requesteddate,
        accepteddate: data.accepteddate,
        friend: data.friend,
        user: data.user
    }).omitBy(_.isUndefined).value();

    return friend;
};

module.exports = Model;