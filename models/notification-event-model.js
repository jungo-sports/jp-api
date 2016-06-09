var _ = require('lodash');

function NotificationEvent(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        id: data.id,
        type: data.type,
        entity: data.entity,
        extra: data.extra,
        createddate: data.createddate
    }).omitBy(_.isUndefined).value();
}

module.exports = NotificationEvent;