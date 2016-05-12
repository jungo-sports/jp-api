var _ = require('lodash');

function User(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        id: data.id,
        username: data.username,
        slug: data.slug,
        email: data.email,
        password: data.password
    }).omitBy(_.isUndefined).value(); // Only 'undefined' values removed, 'null' is valid
}

module.exports = User;