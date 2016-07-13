var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils');

function UserDao() {
    BaseDao.call(this);
};

util.inherits(UserDao, BaseDao);

UserDao.prototype.getTotalUsers = function() {
    return this.executeReadQuery(
        'SELECT COUNT(id) AS total FROM users'
    )
    .then(
        function onSuccess(data) {
            data = (data instanceof Array) ? data : [];
            if (data.length > 0) {
                data = data[0];
            }
            return data.total || 0;
        }
    );
};

UserDao.prototype.getUserByCriteria = function(criteria) {
    var deferred = q.defer();
    criteria = (criteria instanceof Object) ? criteria : {};
    this.executeReadQuery(
        'SELECT * FROM users WHERE ?',
        criteria
    )
    .then(
        function onSuccess(data) {
            data = (data && data.length > 0) ? data[0] : {};
            deferred.resolve(data);
        },
        function onError(error) {
            deferred.reject('Error looking up user by criteria');
        }
    );
    return deferred.promise;
};

UserDao.prototype.getUsersByIds = function(ids) {
    return this.executeReadQuery(
        'SELECT * FROM users WHERE id IN (' + ids.join(',') + ')'
    );
};

UserDao.prototype.getAllUsers = function(offset, limit, options) {
    var _this = this,
        limitQuery = databaseUtils.getLimitForQuery(offset, limit),
        sortQuery = databaseUtils.getSortByForQuery(options.sort),
        users = [];
    return this.executeReadQuery(
        'SELECT * FROM users ORDER BY ' + sortQuery + ' LIMIT ' + limitQuery
    );
};

UserDao.prototype.getUserExtraData = function(userId) {
    return this.executeReadQuery(
        'SELECT field, value FROM users_extra_data WHERE userid = ?',
        [
            userId
        ]
    );
};

UserDao.prototype.getUsersExtraData = function(userIds) {
    return this.executeReadQuery(
        'SELECT * FROM users_extra_data WHERE userid IN (' + userIds.join(',') + ')'
    );
};

UserDao.prototype.updateUser = function(user) {
    var params = {};
    if (user.username) {
        params.username = user.username;
    }
    if (user.slug) {
        params.slug = user.slug;
    }
    if (user.email) {
        params.email = user.email;
    }
    if (user.role) {
        params.role = user.role;
    }
    return this.executeWriteQuery(
        'UPDATE users SET ? WHERE id = ?',
        [
            params,
            user.id
        ]
    );
};

UserDao.prototype.createUser = function(user) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO users SET ?',
        {
            username: user.username,
            slug: user.slug,
            email: user.email,
            role: user.role
        }
    )
    .then(
        function onSuccess(data) {
            if (data && data.insertId) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error creating user');
        },
        function onError(error) {
            var message = 'Error creating user';
            error = (error instanceof Object) ? error : {};
            switch(error.code) {
                case 'ER_BAD_NULL_ERROR':
                    message += ' (invalid values specified)';
                    break;
                case 'ER_DUP_ENTRY':
                    message += ' (duplicate entry)';
                    break;
            }
            deferred.reject(message);
        }
    );
    return deferred.promise;
};

UserDao.prototype.createUserExtraData = function(userId, field, value) {
    if ((value instanceof Array)) {
        value = value.join(',');
    }
    return this.executeWriteQuery(
        'INSERT INTO users_extra_data SET ? ON DUPLICATE KEY UPDATE `field` = VALUES(`field`), `value` = VALUES(`value`)',
        {
            userid: userId,
            field: field,
            value: value
        }
    );
};

UserDao.prototype.deleteUserById = function(id) {
    
};

module.exports = new UserDao();