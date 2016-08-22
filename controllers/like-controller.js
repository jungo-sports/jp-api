var util = require('util'),
    BaseController = require('./base-controller'),
    LikeService = require('../services/like-service');

function LikeController(app) {
    if (!(this instanceof LikeController)) {
        return new LikeController(app);
    }
    BaseController.call(this, app, {
        path: '/likes'
    });
};

util.inherits(LikeController, BaseController);

LikeController.prototype.registerAllMethods = function() {

    this.registerGetMethod('/user/id/:userid/type/:type', this.getLikes);

    this.registerPostMethod('/', this.addLike);

    this.registerDeleteMethod('/user/id/:userid/type/:type/entity/:entity', this.removeLike);

};

LikeController.prototype.getLikes = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        type = request.params.type,
        offset = parseInt(request.query.offset || 0),
        limit = parseInt(request.query.limit || 20);
    LikeService.getLikesByUserAndType(userId, type, offset, limit)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting likes'
                });
            }
        );
};

LikeController.prototype.addLike = function(request, response) {
    var _this = this,
        userId = request.body.userid,
        type = request.body.type,
        entity = request.body.entity;
    LikeService.addLike(userId, type, entity)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error adding like'
                });
            }
        );
};

LikeController.prototype.removeLike = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        type = request.params.type,
        entity = request.params.entity;
    LikeService.removeLike(userId, type, entity)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error removing like'
                });
            }
        );
};

module.exports = LikeController;