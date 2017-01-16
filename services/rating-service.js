var q = require('q'),
    _ = require('lodash'),
    RatingDao = require('../persistence/rating/rating-dao'),
    Rating = require('../models/rating-model'),
    AverageRating = require('../models/average-rating-model'),
    EventService = require('./event-service');

function RatingService() {};

function __getAggregateRating(entity, type) {
    return RatingDao.getCalculatedAverageRating(entity, type)
        .then(
            function onSuccess(data) {
                if (!data || data.length === 0) {
                    return data;
                }
                var averageRating = data[0];
                averageRating.entity = entity;
                averageRating.type = type;
                return new AverageRating(averageRating);
            }
        );
};

function __updateAggregateRating(entity, type) {
    return __getAggregateRating(entity, type)
        .then(
            function onSuccess(data) {
                var averageRating = data;
                return RatingDao.addAggregateRating(entity, type, data.rating, data.total)
                    .then(
                        function onSuccess(data) {
                            return averageRating;
                        }
                    );
            }
        );
};

RatingService.prototype.addRating = function(rating, options) {
    rating = new Rating(rating);
    options = options || {
        publishEvent: true
    };
    return RatingDao.addRating(rating)
        .then(
            function onSuccess(data) {
                return __updateAggregateRating(rating.entity, rating.type);
            }
        )
        .then(
            function onSuccess(data) {
                if (options.publishEvent) {
                    EventService.publishEvent(EventService.keys.RATING_ADD, rating);
                }
                return data;
            }
        );
};

RatingService.prototype.getAverageRatings = function(entity, types) {
    var promises = [];
    types = (types instanceof Array) ? types : [types];
    _.forEach(types, function(type) {
        promises.push(RatingDao.getAverageRating(entity, type));
    });
    return q.all(promises)
        .then(
            function onSuccess(data) {
                return _.map(data, function(rating, index) {
                    if (!rating || _.isEmpty(rating)) {
                        rating = {
                            type: types[index],
                            rating: 0,
                            total: 0,
                            entity: entity
                        };
                    }
                    return new AverageRating(rating);
                });
            }
        );
};

RatingService.prototype.getRatingsByUserId = function(userId, entityId, types) {
    var promises = [];
    types = (types instanceof Array) ? types : [types];
    _.forEach(types, function(type) {
        promises.push(RatingDao.getRatingByUserId(userId, entityId, type));
    });
    return q.all(promises)
        .then(
            function onSuccess(data) {
                return _.map(data, function(rating) {
                    return new Rating(rating);
                }).filter(function(rating) {
                    return !_.isEmpty(rating);
                });
            }
        );
};

RatingService.prototype.getUserRatings = function(userId, offset, limit) {
    return RatingDao.getUserRatings(userId, offset, limit);
};

RatingService.prototype.getUniqueRatingCountsByUserId = function(userId) {
    return RatingDao.getUniqueRatingCountsByUserId(userId);
};

RatingService.prototype.getUniqueRatedEntitiesByUserIds = function(userIds) {
    return RatingDao.getUniqueRatedEntitiesByUserIds(userIds)
        .then(
            function onSuccess(data) {
                return {
                    ratings: data
                }
            }
        );
};

RatingService.prototype.getRatings = function(entityId, types, offset, limit) {
    return q.all(
        [
            RatingDao.getTotalRatings(entityId, types),
            RatingDao.getRatings(entityId, types, offset, limit)
        ]
    )
    .then(
        function onSuccess(data) {
            return {
                total: data[0] || 0,
                ratings: data[1] || []
            }
        }
    );
};

module.exports = new RatingService();