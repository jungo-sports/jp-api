var _ = require('lodash'),
    q = require('q'),
    util = require('util'),
    BaseController = require('./base-controller'),
    FollowService = require('../services/follow-service'),
    UserService = require('../services/user-service'),
    Follow = require('../models/follow-model');

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

    this.registerGetMethod('/user/id/:userid', this.getFollowers);

    this.registerGetMethod('/following/user/id/:userid', this.getFollowing);

    this.registerPostMethod('/', this.addFollower);

    this.registerDeleteMethod('/user/id/:userid/follower/id/:followerid', this.removeFollower);

};

function __populateUsersForFollowers(followers) {
    var deferred = q.defer(),
        userIds = [];

    userIds = _.uniq(
        _.map(followers.follows, _.property('userid'))
        .concat(_.map(followers.follows, _.property('followerid')))
    );

    UserService.getUsersByIds(userIds)
        .then(
            function onSuccess(data) {
                followers.follows = _.map(followers.follows, function(follower) {
                    follower.user = data[follower.userid];
                    follower.follower = data[follower.followerid];
                    delete follower.userid;
                    delete follower.followerid;
                    return new Follow(follower);
                });
                deferred.resolve(followers);
            },
            function onError(error) {
                deferred.resolve(followers);
            }
        );

    return deferred.promise;
};

FollowController.prototype.getFollowers = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        offset = request.query.offset || 0,
        limit = request.query.limit || 25;

    FollowService.getFollowers(userId, offset, limit)
        .then(
            function onSuccess(data) {
                if (data && data.follows && data.follows.length > 0) {
                    __populateUsersForFollowers(data)
                        .then(
                            function onSuccess(data) {
                                _this.sendSuccess(response, data);
                            }
                        );
                } else {
                    _this.sendSuccess(response, data);
                }
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting followers for user'
                });
            }
        );
};

FollowController.prototype.getFollowing = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        offset = request.query.offset || 0,
        limit = request.query.limit || 25,
        type = request.query.type;

    FollowService.getFollowing(userId, offset, limit, type)
        .then(
            function onSuccess(data) {
                if (data && data.follows && data.follows.length > 0) {
                    __populateUsersForFollowers(data)
                        .then(
                            function onSuccess(data) {
                                _this.sendSuccess(response, data);
                            }
                        );
                } else {
                    _this.sendSuccess(response, data);
                }
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting followers for user'
                });
            }
        );
};

FollowController.prototype.addFollower = function(request, response) {
    var _this = this,
        userId = request.body.userid,
        followerId = request.body.followerid,
        type = request.body.type;

    FollowService.addFollower(userId, followerId, type)
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
        userId = request.params.userid,
        followerId = request.params.followerid;

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