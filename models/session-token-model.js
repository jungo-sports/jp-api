var _ = require('lodash');

function SessionToken(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        token: data.token,
        expires: (data.expires instanceof Date) ? data.expires.getTime() : data.expires
    }).omitBy(_.isUndefined).value(); // Only 'undefined' values removed, 'null' is valid
}

module.exports = SessionToken;