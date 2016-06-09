var util = require('util'),
    BaseController = require('./base-controller'),
    FollowService = require('../services/follow-service');

function FollowController(app) {
    if (!(this instanceof FollowController)) {
        return new FollowController(app);
    }
    BaseController.call(this, app, {
        path: '/follow'
    });
};

util.inherits(FollowController, BaseController);

FollowController.prototype.registerAllMethods = function() {

    this.registerPostMethod('/', this.addFollower);

    this.registerDeleteMethod('/', this.removeFollower);

};

FollowController.prototype.addFollower = function(request, response) {
    var _this = this,
        userId = request.body.userId,
        followerId = request.body.followerId;

    FollowService.addFollower(userId, followerId)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error adding follower'
                });
            }
        );
};

FollowController.prototype.removeFollower = function(request, response) {
    var _this = this,
        userId = request.body.userId,
        followerId = request.body.followerId;

    FollowService.removeFollower(userId, followerId)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error removing follower'
                });
            }
        );
};

module.exports = FollowController;