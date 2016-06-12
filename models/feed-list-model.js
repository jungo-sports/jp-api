var _ = require('lodash');

function Model(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        events: data.events || [],
        total: data.total || 0
    }).omitBy(_.isUndefined).value();
}

module.exports = Model;