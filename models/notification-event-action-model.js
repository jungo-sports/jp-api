var _ = require('lodash');

function Model(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        event: data.event,
        action: data.action
    }).omitBy(_.isUndefined).value();
}

module.exports = Model;