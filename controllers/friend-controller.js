var util = require('util'),
    BaseController = require('./base-controller'),
    FriendService = require('../services/friend-service');

function FriendController(app) {
    if (!(this instanceof FriendController)) {
        return new FriendController(app);
    }
    BaseController.call(this, app, {
        path: '/friends'
    });
};

util.inherits(FriendController, BaseController);

FriendController.prototype.registerAllMethods = function() {
    this.registerGetMethod('/user/id/:userid', this.getFriendsByUserId)
};

FriendController.prototype.getFriendsByUserId = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        offset = parseInt(request.query.offset || 0),
        limit = parseInt(request.query.limit || 20);
    FriendService.getFriendsByUserId(userId, offset, limit)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting friends'
                });
            }
        );
};

module.exports = FriendController;