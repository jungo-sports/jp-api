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

DatabaseUtils.prototype.getErrorByCode = function(code) {
    var message;
    switch(code) {
        case 'ER_BAD_NULL_ERROR':
            message = '(invalid values specified)';
            break;
        case 'ER_DUP_ENTRY':
            message = '(duplicate entry)';
            break;
        case 'ER_NO_REFERENCED_ROW_2':
            message = '(no user found)';
            break;
        default:
            message = '(unknown)';
            break;
    }
    return message;
};

module.exports = new DatabaseUtils();