var _ = require('lodash'),
    q = require('q'),
    FollowDao = require('../persistence/follow/follow-dao'),
    Follow = require('../models/follow-model'),
    FollowList = require('../models/follow-list-model'),
    EventService = require('./event-service');

function FollowService() {};

FollowService.prototype.getFollowerById = function(id) {
    return FollowDao.getFollowerById(id);
};

FollowService.prototype.getIsUserFollowing = function(userId, followerId) {
    return FollowDao.getFollower(userId, followerId)
        .then(
            function onSuccess(data) {
                if (!data || !data.id) {
                    return false;
                }
                return true;
            }
        )
        .catch(
            function onError(error) {
                return false;
            }
        );
};

FollowService.prototype.getIsUserFollowingList = function(userId, followerIds) {
    return FollowDao.getFollowers(userId, followerIds)
        .then(
            function onSuccess(data) {
                var followers = {};
                _.forEach(followerIds, function(followerId) {
                    var follower = _.find(data, function(user) {
                        return (user.followerid === followerId);
                    });
                    followers[followerId] = (follower !== undefined);
                });
                return followers;
            }
        );
};

FollowService.prototype.addFollower = function(userId, followerId) {
    return FollowDao.addFollower(userId, followerId)
        .then(
            function onSuccess(data) {
                return FollowDao.getFollowerById(data.id);
            }
        )
        .then(
            function onSuccess(data) {
                EventService.publishEvent(EventService.keys.FOLLOW_ADD, new Follow(data));
                return data;
            }
        );
};

FollowService.prototype.removeFollower = function(userId, followerId) {
    var deferred = q.defer();
    FollowDao.getFollower(userId, followerId)
        .then(
            function onSuccess(data) {
                if (!data || !data.id) {
                    return deferred.reject('No follow found');
                }
                EventService.publishEvent(EventService.keys.FOLLOW_REMOVE, new Follow(data));
                return FollowDao.removeFollower(userId, followerId);
            }
        )
        .then(
            function onSuccess(data) {
                deferred.resolve(data);
            }
        );
    return deferred.promise;
};

FollowService.prototype.getFollowers = function(userId, offset, limit) {
    var followers = [];
    return FollowDao.getFollowersForUserId(userId, offset, limit)
        .then(
            function onGetFollowersSuccess(data) {
                followers = data;
                return FollowDao.getTotalFollowersForUserId(userId);
            }
        )
        .then(
            function onGetTotalFollowersSuccess(data) {
                return new FollowList(followers, data);
            }
        );
};

module.exports = new FollowService();