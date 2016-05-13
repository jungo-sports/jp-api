var q = require('q'),
    slug = require('slug'),
    UserDao = require('../persistence/user/user-dao'),
    SessionDao = require('../persistence/user/session-dao'),
    AuthenticationDao = require('../persistence/user/authentication-dao'),
    User = require('../models/user-model'),
    NotFoundError = require('../models/errors/not-found-error'),
    stringUtils = require('../utils/string-utils'),
    dateUtils = require('../utils/date-utils');

function UserService() {};

UserService.prototype.getAllUsers = function(offset, limit, options) {
    options = (options instanceof Object) ? options : {};
    return UserDao.getAllUsers(offset, limit, {
        sort: options.sort || '-id'
    });
};

UserService.prototype.getUserById = function(id) {
    return UserDao.getUserByCriteria({
        id: id
    });
};

UserService.prototype.getUserByEmail = function(email) {
    return UserDao.getUserByCriteria({
        email: email
    });
};

UserService.prototype.getUserByUsername = function(username) {
    return this.getUserBySlug(slug(username));
};

UserService.prototype.getUserBySlug = function(slug) {
    return UserDao.getUserByCriteria({
        slug: slug
    });
};

UserService.prototype.getUserByUsernameOrEmail = function(value) {
    var _this = this;
    return _this.getUserByUsername(value)
        .then(
            function onSuccess(data) {
                if (data && data.id) {
                    return data;
                }
                return _this.getUserByEmail(value);
            }
        );
};

UserService.prototype.getUserBySessionToken = function(token, userAgent, ipAddress) {
    var _this = this;
    return SessionDao.getSessionByCriteria({ token: token })
        .then(
            function onSuccess(data) {

                // Invalid or missing data...
                if (!data || !data.userid) {
                    return null;
                }

                // Someone trying to re-use a token from another client...
                if (data.ipaddress !== ipAddress || data.useragent !== userAgent) {
                    return null;
                }

                // Expired...
                if (!data.expires || data.expires < dateUtils.getUTCDate()) {
                    return null;
                }

                return _this.getUserById(data.userid);
            }
        );
};

UserService.prototype.createUser = function(user) {
    var _this = this;
    user = new User(user);
    if (!user.password) {
        var deferred = q.defer();
        deferred.reject('Password required to create a new user');
        return deferred.promise;
    }
    user.slug = slug(user.username);
    return UserDao.createUser(user)
        .then(
            function onSuccess(data) {
                if (data && data.id) {
                    user.id = data.id;
                    return AuthenticationDao.createUserAuthentication(data.id, user.password);
                }
                return data;
            }
        )
        .then(
            function onSuccess(data) {
                return _this.getUserById(user.id);
            }
        );
};

UserService.prototype.createSessionByPassword = function(username, password, useragent, ipaddress) {
    var deferred = q.defer(),
        user = {};

    this.getUserByUsernameOrEmail(username)
        .then(
            function onSuccess(data) {
                if (!data || !data.id) {
                    return deferred.reject(new NotFoundError('No user found'));
                }
                user = data;
                return AuthenticationDao.getAuthenticationByPassword(data.id, password);
            }
        )
        .then(
            function onSuccess(data) {
                if (data) {
                    return SessionDao.createSessionForUser(
                        user.id, 
                        stringUtils.getRandomToken(32), 
                        dateUtils.getUTCDate().add(3, 'months').toDate(),
                        useragent,
                        ipaddress
                    );
                }
                deferred.reject('Error authenticating user');
            }
        )
        .then(
            function onSuccess(data) {
                if (data && data.id) {
                    return SessionDao.getSessionByCriteria({
                        id: data.id
                    });
                }
                deferred.reject('Invalid response while creating session for user');
            }
        )
        .then(
            function onSuccess(data) {
                if (data && data.expires) {
                    data.expires = new Date(data.expires);
                }
                deferred.resolve({
                    user: user,
                    sessionToken: data
                });
            }
        )
        .catch(
            function onError(error) {
                deferred.reject(error || 'Error creating session for user');
            }
        );
    return deferred.promise;
};

UserService.prototype.resetUserPassword = function(email, token) {
    var deferred = q.defer();
    this.getUserByEmail(email)
        .then(
            function onSuccess(data) {
                if (!data || !data.id) {
                    return deferred.reject(new NotFoundError('No user found'));
                }
                if (token) {
                    
                }
                return data;
            }
        );
    return deferred.promise;
};

UserService.prototype.updateUser = function(user) {
    user = (user instanceof Object) ? user : {};
    if (!user.id) {
        return;
    }
    user = new User(user);
    return UserDao.updateUser(user);
};

UserService.prototype.deleteUserById = function(id) {
    return UserDao.deleteUserById(id);
};

module.exports = new UserService();