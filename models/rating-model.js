var _ = require('lodash');

function Rating(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        id: data.id,
        userid: data.userid,
        entity: data.entity,
        type: data.type,
        rating: data.rating,
        comment: data.comment
    }).omitBy(_.isUndefined).value(); // Only 'undefined' values removed, 'null' is valid
}

module.exports = Rating;