var q = require('q'),
    _ = require('lodash'),
    RatingDao = require('../persistence/rating/rating-dao'),
    Rating = require('../models/rating-model'),
    AverageRating = require('../models/average-rating-model');

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

RatingService.prototype.addRating = function(rating) {
    rating = new Rating(rating);
    return RatingDao.addRating(rating)
        .then(
            function onSuccess(data) {
                return __updateAggregateRating(rating.entity, rating.type);
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
                });
            }
        );
};

module.exports = new RatingService();