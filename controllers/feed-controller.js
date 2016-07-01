var util = require('util'),
    BaseController = require('./base-controller'),
    FeedService = require('../services/feed-service');

function FeedController(app) {
    if (!(this instanceof FeedController)) {
        return new FeedController(app);
    }
    BaseController.call(this, app, {
        path: '/feeds'
    });
};

util.inherits(FeedController, BaseController);

FeedController.prototype.registerAllMethods = function() {
    this.registerGetMethod('/user/id/:userid', this.getFeedByUserId)
};

FeedController.prototype.getFeedByUserId = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        offset = parseInt(request.query.offset || 0),
        limit = parseInt(request.query.limit || 20);
    FeedService.getFeedByUserId(userId, offset, limit)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting feed'
                });
            }
        );
};

module.exports = FeedController;