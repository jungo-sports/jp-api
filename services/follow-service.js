var q = require('q'),
    FollowDao = require('../persistence/follow/follow-dao'),
    Follow = require('../models/follow-model'),
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
    return FollowDao.getFollowersForUserId(userId, offset, limit);
};

module.exports = new FollowService();