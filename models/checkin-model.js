var _ = require('lodash');

function Model(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        id: data.id,
        userid: data.userid,
        type: data.type,
        longitude: data.longitude,
        latitude: data.latitude,
        name: data.name,
        description: data.description,
        date: data.date,
        user: data.user
    }).omitBy(_.isUndefined).value();
}

module.exports = Model;