var util = require('util'),
    BaseController = require('./base-controller'),
    RatingService = require('../services/rating-service');

function RatingController(app) {
    if (!(this instanceof RatingController)) {
        return new RatingController(app);
    }
    BaseController.call(this, app, {
        path: '/ratings'
    });
};

util.inherits(RatingController, BaseController);

RatingController.prototype.registerAllMethods = function() {

    this.registerGetMethod('/userid/:userid/entity/:entity/type/:types', this.getRatingsByUserId);

    this.registerGetMethod('/entity/:entity/type/:types', this.getAverageRatings);

    this.registerPostMethod('/', this.createRating);

};

RatingController.prototype.getRatingsByUserId = function(request, response) {
    var _this = this;
    RatingService.getRatingsByUserId(request.params.userid, request.params.entity, request.params.types.split(','))
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting ratings'
                });
            }
        );
};

RatingController.prototype.getAverageRatings = function(request, response) {
    var _this = this;
    RatingService.getAverageRatings(request.params.entity, request.params.types.split(','))
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting ratings'
                });
            }
        );
};

RatingController.prototype.createRating = function(request, response) {
    var _this = this;
    RatingService.addRating(request.body)
        .then(
            function onSuccess(data) {
                _this.sendCreatedSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    created: false,
                    error: error || 'Error adding rating'
                });
            }
        );
};

module.exports = RatingController;