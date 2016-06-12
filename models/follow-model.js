var _ = require('lodash');

function Follow(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        id: data.id,
        userid: data.userid,
        followerid: data.followerid,
        followdate: data.followdate,
        user: data.user || undefined,
        follower: data.follower || undefined
    }).omitBy(_.isUndefined).value();
}

module.exports = Follow;