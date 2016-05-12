function DatabaseUtils() {};

DatabaseUtils.prototype.getLimitForQuery = function(offset, limit) {
    offset = (isNaN(offset)) ? 0 : offset;
    limit = (isNaN(limit)) ? 0 : limit;
    return [offset, limit].join(',');
};

DatabaseUtils.prototype.getSortByForQuery = function(sort) {
    var direction = 'ASC';
    sort = (typeof sort === 'string') ? sort : 'id';
    if (sort.lastIndexOf('-', 0) === 0 || sort.lastIndexOf('+', 0) === 0) {
        direction = (sort.lastIndexOf('-', 0) === 0) ? 'DESC' : 'ASC';
        sort = sort.substr(1);
    }
    return sort + ' ' + direction;
};

module.exports = new DatabaseUtils();