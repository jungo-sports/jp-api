var _ = require('lodash');

function AverageRating(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        entity: data.entity,
        type: data.type,
        rating: data.rating,
        total: data.total,
        date: data.date
    }).omitBy(_.isUndefined).value(); // Only 'undefined' values removed, 'null' is valid
}

module.exports = AverageRating;