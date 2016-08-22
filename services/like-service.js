var _ = require('lodash'),
    q = require('q'),
    LikeDao = require('../persistence/like/like-dao');

function LikeService() {};

LikeService.prototype.addLike = function(userId, type, entity) {
    return LikeDao.addLike(userId, type, entity);
};

LikeService.prototype.removeLike = function(userId, type, entity) {
    return LikeDao.removeLike(userId, type, entity);
};

LikeService.prototype.getLikesByUserAndType = function(userId, type, offset, limit) {
    return q.all(
        [
            LikeDao.getLikesForUserAndType(userId, type, offset, limit),
            LikeDao.getTotalLikesForUserAndType(userId, type)
        ]
    )
    .then(
        function onSuccess(data) {
            var likes = data[0],
                total = data[1];
            return {
                likes: likes || [],
                total: total || 0
            }
        }
    );
};

LikeService.prototype.getLikeForUserAndEntity = function(userId, type, entity) {
    return LikeDao.getLikeForUserAndEntity(userId, type, entity);
}

module.exports = new LikeService();