var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

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

RatingDao.prototype.getUserRatings = function(userId, offset, limit) {
    return this.executeReadQuery(
        'SELECT * FROM ratings WHERE userid = ? ORDER BY date DESC LIMIT ?, ?',
        [
            userId,
            offset,
            limit
        ]
    )
};

RatingDao.prototype.getTotalUserRatings = function(userId) {
    return this.executeReadQuery(
            'SELECT COUNT(*) AS total FROM ratings WHERE userid = ?',
            [
                userId
            ]
        )
        .then(
            function onSuccess(data) {
                if (!data || data.length === 0) {
                    return 0;
                }
                return parseInt(data[0].total) || 0;
            }
        );
};

RatingDao.prototype.getUniqueRatingCountsByUserId = function(user) {
    return this.executeReadQuery(
        'SELECT COUNT(DISTINCT(entity)) AS total FROM ratings WHERE userid = ?',
        [
            user
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return 0;
            }
            return parseInt(data.total) || 0;
        }
    );
};

RatingDao.prototype.getUniqueRatedEntitiesByUserIds = function(userIds) {
    return this.executeReadQuery(
        'SELECT DISTINCT(entity), userid FROM ratings WHERE userid IN (' + userIds.join(',') + ') ORDER BY userid, date DESC'
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
            comment: rating.comment,
            date: dateUtils.getUTCDate().toDate()
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

RatingDao.prototype.getRatings = function(entity, types, offset, limit) {
    var limitQuery = databaseUtils.getLimitForQuery(offset, limit);
    return this.executeReadQuery(
        'SELECT * FROM ratings WHERE entity = ? AND type IN (?) ORDER BY date DESC LIMIT ' + limitQuery,
        [
            entity,
            types
        ]
    );
};

RatingDao.prototype.getTotalRatings = function(entity, types) {
    return this.executeReadQuery(
        'SELECT COUNT(*) AS total FROM ratings WHERE entity = ? AND type IN (?)',
        [
            entity,
            types
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

RatingDao.prototype.getAverageRatingsForEntities = function(entityIds, type) {
    return this.executeReadQuery(
        'SELECT * FROM ratings_aggregates WHERE entity IN (?) AND type = ?',
        [
            entityIds,
            type
        ]
    )
};

module.exports = new RatingDao();