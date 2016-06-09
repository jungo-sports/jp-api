var _ = require('lodash');

function Follow(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        id: data.id,
        userid: data.userid,
        followerid: data.followerid,
        followdate: data.followdate
    }).omitBy(_.isUndefined).value();
}

module.exports = Follow;