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

    this.registerGetMethod('/user/id/:userid', this.getFriendsByUserId);

    this.registerGetMethod('/user/id/:userid/friend/id/:friendid', this.getIsUserFriend);

    this.registerPostMethod('/', this.addFriendRequest);

    this.registerPostMethod('/accept', this.acceptFriendRequest);

    this.registerDeleteMethod('/user/id/:userid/friend/id/:friendid', this.declineFriendRequest);

    this.registerDeleteMethod('/id/:id', this.deleteFriendById);
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

FriendController.prototype.getIsUserFriend = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        friendId = request.params.friendid;

    FriendService.getIsUserFriend(userId, friendId)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, {
                    friend: data
                });
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

FriendController.prototype.addFriendRequest = function(request, response) {
    var _this = this,
        userId = request.body.userid,
        friendId = request.body.friendid;

    FriendService.addFriendRequest(userId, friendId)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error adding friend request'
                });
            }
        );
};

FriendController.prototype.acceptFriendRequest = function(request, response) {
    var _this = this,
        userId = request.body.userid,
        friendId = request.body.friendid;

    FriendService.acceptFriendRequest(userId, friendId)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error accepting friend request'
                });
            }
        );
};

FriendController.prototype.declineFriendRequest = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        friendId = request.params.friendid;

    FriendService.declineFriendRequest(userId, friendId)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error declining friend request'
                });
            }
        );
};

FriendController.prototype.deleteFriendById = function(request, response) {
    var _this = this,
        id = request.params.id;

    FriendService.deleteFriendById(id)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error deleting friend request'
                });
            }
        );
};

module.exports = FriendController;