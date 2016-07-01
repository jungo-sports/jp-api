var _ = require('lodash'),
    q = require('q'),
    slug = require('slug'),
    apiConfig = require('../utils/api-config'),
    UserDao = require('../persistence/user/user-dao'),
    SessionDao = require('../persistence/user/session-dao'),
    AuthenticationDao = require('../persistence/user/authentication-dao'),
    User = require('../models/user-model'),
    UserList = require('../models/user-list-model'),
    NotFoundError = require('../models/errors/not-found-error'),
    stringUtils = require('../utils/string-utils'),
    dateUtils = require('../utils/date-utils'),
    SearchService = require('./search-service'),
    EventService = require('./event-service'),
    MediaService = require('./media-service');

function UserService() {};

function __getUserByCriteria(criteria) {
    var user;
    return UserDao.getUserByCriteria(criteria)
        .then(
            function onSuccess(data) {
                user = data;
                if (user && user.id) {
                    return UserDao.getUserExtraData(user.id);
                }
                return data;
            }
        )
        .then(
            function onSuccess(data) {
                if (!data || data.length === 0) {
                    return user;
                }
                _.forEach(data, function(value) {
                    if (value.field === 'avatar') {
                        user[value.field] = apiConfig.get('paths.images') + value.value;
                    } else {
                        user[value.field] = value.value;
                    }
                });
                if (!user.avatar) {
                    
                    // Pull from config?
                    user.avatar = 'http://www.gravatar.com/avatar?d=mm&s=100';
                }
                return user;
            }
        );
}

UserService.prototype.getAllUsers = function(offset, limit, options) {
    options = (options instanceof Object) ? options : {};
    var users = [];
    return UserDao.getAllUsers(offset, limit, {
                sort: options.sort || '-id'
            }
        )
        .then(
            function onSuccess(data) {
                var ids = _.map(data, 'id');
                users = _.keyBy(data, 'id');
                return UserDao.getUsersExtraData(ids);
            }
        )
        .then(
            function onSuccess(data) {
                _.forEach(data, function(value) {
                    var id = value.userid;
                    if (users[id]) {
                        users[id][value.field] = value.value;
                    }
                });
                users = _.map(users, function(value) {
                    return value;
                });
                return UserDao.getTotalUsers();
            }
        )
        .then(
            function onSuccess(data) {
                return new UserList(users, data);
            }
        );
};

UserService.prototype.searchUsers = function(parameters, offset, limit, sort) {

};

UserService.prototype.getUserById = function(id) {
    return __getUserByCriteria({
        id: id
    });
};

UserService.prototype.getUsersByIds = function(ids) {
    var users = [];
    return UserDao.getUsersByIds(ids)
        .then(
            function onSuccess(data) {
                users = _.keyBy(data, 'id');
                return UserDao.getUsersExtraData(ids);
            }
        )
        .then(
            function onSuccess(data) {
                _.forEach(data, function(value) {
                    var id = value.userid;
                    if (users[id]) {
                        users[id][value.field] = value.value;
                    }
                });
                return users;
            }
        );
};

UserService.prototype.getUserByEmail = function(email) {
    return __getUserByCriteria({
        email: email
    });
};

UserService.prototype.getUserByUsername = function(username) {
    return this.getUserBySlug(slug(username));
};

UserService.prototype.getUserBySlug = function(slug) {
    return __getUserByCriteria({
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
                if (user.avatar) {
                    return MediaService.uploadImage(user.avatar, 'user-avatar/' + user.id)
                        .then(
                            function onSuccess(data) {
                                if (data && data.key) {
                                    user.extra = user.extra || {};
                                    user.extra.avatar = data.key + '?v=' + (new Date().getTime());
                                }
                            }
                        );
                }
                return data;
            }
        )
        .then(
            function onSuccess(data) {
                var extraData = [];
                _.forOwn(user.extra, function(value, key) {
                    extraData.push(
                        UserDao.createUserExtraData(user.id, key, value)
                    );
                });
                return q.all(extraData);
            }
        )
        .then(
            function onSuccess(data) {
                return _this.getUserById(user.id);
            }
        )
        .then(
            function onSuccess(data) {
                EventService.publishEvent(EventService.keys.USER_ADD, data);
                return data;
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

UserService.prototype.updateUserById = function(id, user) {
    var _this = this;
    user = (user instanceof Object) ? user : {};
    user.id = id;
    user = new User(user);
    return UserDao.updateUser(user)
        .then(
            function onSuccess(data) {
                if (user.avatar) {
                    return MediaService.uploadImage(user.avatar, 'user-avatar/' + user.id)
                        .then(
                            function onSuccess(data) {
                                if (data && data.key) {
                                    user.extra = user.extra || {};
                                    user.extra.avatar = data.key + '?v=' + (new Date().getTime());
                                }
                            }
                        );
                }
                return data;
            }
        )
        .then(
            function onSuccess(data) {
                var extraData = [];
                _.forOwn(user.extra, function(value, key) {
                    extraData.push(
                        UserDao.createUserExtraData(user.id, key, value)
                    );
                });
                return q.all(extraData);
            }
        )
        .then(
            function onSuccess(data) {
                return _this.getUserById(user.id);
            }
        )
        .then(
            function onSuccess(data) {
                EventService.publishEvent(EventService.keys.USER_UPDATE, data);
                return data;
            }
        );
};

UserService.prototype.deleteUserById = function(id) {
    return UserDao.deleteUserById(id);
};

module.exports = new UserService();