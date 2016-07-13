var _ = require('lodash');

function User(data) {

    data = (data instanceof Object) ? data : {};

    var user = _({
        id: data.id,
        avatar: data.avatar,
        username: data.username,
        slug: data.slug,
        email: data.email,
        password: data.password,
        role: parseInt(data.role),
        extra: {}
    }).omitBy(_.isUndefined).value();

    _.forOwn(data, function(value, key) {
        if (user[key] === undefined && user.extra[key] === undefined) {
            user.extra[key] = value;
        }
    });

    return user;
}

module.exports = User;