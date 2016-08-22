var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils');

function RatingDao() {
    BaseDao.call(this);
};

util.inherits(RatingDao, BaseDao);

RatingDao.prototype.getRatingByUserId = function(user, entity, type) {
    return this.executeReadQuery(
        'SELECT * FROM ratings WHERE userid = ? AND entity = ? AND type = ?',
        [
            user,
            entity,
            type
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return {};
            }
            return data[0];
        }
    );
};

RatingDao.prototype.getCalculatedAverageRating = function(entity, types) {
    types = (types instanceof Array) ? types : [types];
    return this.executeReadQuery(
        'SELECT AVG(rating) AS rating, COUNT(id) AS total FROM ratings WHERE entity = ? AND type IN (?)',
        [
            entity,
            types.join(',')
        ]
    );
};

RatingDao.prototype.getAverageRating = function(entity, type) {
    return this.executeReadQuery(
        'SELECT * FROM ratings_aggregates WHERE entity = ? AND type = ?',
        [
            entity,
            type
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return {};
            }
            return data[0];
        }
    );
};

RatingDao.prototype.addRating = function(rating) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO ratings SET ? ON DUPLICATE KEY UPDATE `rating` = VALUES(`rating`), `comment` = VALUES(`comment`)',
        {
            userid: rating.userid,
            entity: rating.entity,
            type: rating.type,
            rating: rating.rating,
            comment: rating.comment
        }
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error creating rating');
        },
        function onError(error) {
            var message = 'Error creating rating';
            error = (error instanceof Object) ? error : {};
            switch(error.code) {
                case 'ER_BAD_NULL_ERROR':
                    message += ' (invalid values specified)';
                    break;
                case 'ER_DUP_ENTRY':
                    message += ' (duplicate entry)';
                    break;
                case 'ER_NO_REFERENCED_ROW_2':
                    message += ' (no user found)';
                    break;
            }
            deferred.reject(message);
        }
    );
    return deferred.promise;
};

RatingDao.prototype.addAggregateRating = function(entity, type, rating, total) {
    return this.executeWriteQuery(
        'INSERT INTO ratings_aggregates SET ? ON DUPLICATE KEY UPDATE `rating` = VALUES(`rating`), `total` = VALUES(`total`)',
        {
            entity: entity,
            type: type,
            rating: rating,
            total: total
        }
    );
};

RatingDao.prototype.getRatings = function(entity, type, offset, limit) {
    var limitQuery = databaseUtils.getLimitForQuery(offset, limit);
    return this.executeReadQuery(
        'SELECT * FROM ratings WHERE entity = ? AND type = ? ORDER BY id ASC LIMIT ' + limitQuery,
        [
            entity,
            type
        ]
    );
};

RatingDao.prototype.getTotalRatings = function(entity, type) {
    return this.executeReadQuery(
        'SELECT COUNT(*) AS total FROM ratings WHERE entity = ? AND type = ?',
        [
            entity,
            type
        ]
    )
    .then(
        function onSuccess(data) {
            data = (data instanceof Array) ? data : [];
            if (data.length > 0) {
                data = data[0];
            }
            return data.total || 0;
        }
    );
};

module.exports = new RatingDao();