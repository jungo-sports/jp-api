var util = require('util'),
    BaseController = require('./base-controller'),
    UserService = require('../services/user-service'),
    User = require('../models/user-model'),
    UserList = require('../models/user-list-model'),
    SessionToken = require('../models/session-token-model'),
    NotFoundError = require('../models/errors/not-found-error');

function UserController(app) {
    if (!(this instanceof UserController)) {
        return new UserController(app);
    }
    BaseController.call(this, app, {
        path: '/users'
    });
};

util.inherits(UserController, BaseController);

UserController.prototype.registerAllMethods = function() {

    /**
     * @api {get} /users Get all users
     * @apiName getAllUsers
     * @apiGroup User
     * @apiDescription
     *     Returns all users. Can be used with limit and offset parameters to
     *     paginate through the results.
     *
     * @apiParam {Number} [limit] Maximum number of users to return
     * @apiParam {Number} [offset] Offset number to return in results
     * @apiParam {String} [sort] Desired sort param, starting with - or +
     *
     * @apiSuccess {Object} response Response object
     * @apiSuccess {User[]} response.users List of users
     * @apiSuccess {Number} response.total Total number of users
     */
    this.registerGetMethod('/', this.getAllUsers);

    /**
     * @api {get} /users/id/:userid Get user by ID
     * @apiName getUserById
     * @apiGroup User
     * @apiDescription
     *     Returns the user matching the provided ID.
     *
     * @apiParam {Number} userid ID of the user
     *
     * @apiSuccess {User} user User matching the ID
     */
    this.registerGetMethod('/id/:userid', this.getUserById);

    /**
     * @api {get} /users/email/:email Get user by email
     * @apiName getUserByEmail
     * @apiGroup User
     * @apiDescription
     *     Returns the user matching the provided email address.
     *
     * @apiParam {String} email Email address of the user
     *
     * @apiSuccess {User} user User matching the email address
     */
    this.registerGetMethod('/email/:email', this.getUserByEmail);

    /**
     * @api {get} /users/username/:username Get user by username
     * @apiName getUserByUsername
     * @apiGroup User
     * @apiDescription
     *     Returns the user matching the provided username.
     *
     * @apiParam {String} username Username of the user
     *
     * @apiSuccess {User} user User matching the username
     */
    this.registerGetMethod('/username/:username', this.getUserByUsername);

    /**
     * @api {get} /users/slug/:slug Get user by slug
     * @apiName getUserBySlug
     * @apiGroup User
     * @apiDescription
     *     Returns the user matching the provided slug.
     *
     * @apiParam {String} slug Slug of the user
     *
     * @apiSuccess {User} user User matching the slug
     */
    this.registerGetMethod('/slug/:slug', this.getUserBySlug);


    this.registerGetMethod('/token/:token', this.getUserBySessionToken);

    /**
     * @api {post} /users Create new user
     * @apiName createUser
     * @apiGroup User
     * @apiDescription
     *     Creates a new user. Checks for existing user with the same username or
     *     email address and rejects if found.
     *
     * @apiParam {String} username Username for the user
     * @apiParam {String} email Email address for the user
     *
     * @apiSuccess {User} user Newly created user
     */
    this.registerPostMethod('/', this.createUser);

    /**
     * @api {post} /users/login/password Log in with password
     * @apiName createSessionByPassword
     * @apiGroup User
     * @apiDescription
     *     Logs a user in via username/email and password. If successful, an
     *     authentication token is returned. This token has an expire date, but
     *     refreshes if requested from the same device before expiration.
     *
     * @apiParam {String} username Username for the user (can also be email)
     * @apiParam {String} password User provided password
     *
     * @apiSuccess {Object} response Response object
     * @apiSuccess {User} response.user User profile
     * @apiSuccess {SessionToken} response.sessionToken Generated session token
     */
    this.registerPostMethod('/login/password', this.createSessionByPassword);

    /**
     * @api {post} /users/reset/password Reset user password
     * @apiName resetUserPassword
     * @apiGroup User
     * @apiDescription
     *     Resets a user's password. If a confirmation token is provided it is
     *     assumed that the password reset has already been requested and this
     *     is the confirmation. If no token is present, it is assumed the user
     *     is requesting to reset their password, and to generate a token.
     *
     * @apiParam {String} email Email address for the user
     * @apiParam {String} [token] Generated request token
     *
     * @apiSuccess {Object} response Response object
     * @apiSuccess {Boolean} response.success Whether or not the request was successful
     */
    this.registerPostMethod('/reset/password', this.resetUserPassword);

    // PUT
    this.registerPutMethod('/id/:userid', this.updateUserById, {
        loggedInAs: 'path.userid'
    });

    // DELETE
    this.registerDeleteMethod('/id/:userid', this.deleteUserById, {
        loggedInAs: 'admin'
    });
};

function __getUserBySuccess(response, data) {
    if (!data || !data.id) {
        return this.sendNotFoundError(response, {
            error: 'User not found'
        });
    }
    this.sendSuccess(response, new User(data));
};

function __getUserByError(response, error) {
    _this.sendServerError(response, {
        error: error || 'Error looking up user'
    });
};

UserController.prototype.getAllUsers = function(request, response) {
    var _this = this,
        offset = request.query.offset || 0,
        limit = request.query.limit || 20,
        sort = request.query.sort || 'id';
    UserService.getAllUsers(offset, limit, { sort: sort })
        .then(
            function onSuccess(data) {
                data = (data instanceof Object) ? data : {};
                data.users = (data.users instanceof Array) ? data.users : [];
                data.total = data.total || 0;
                _this.sendSuccess(response, new UserList(data.users, data.total));
            },
            function onError(error) {
                _this.sendServerError(response, {
                    error: error || 'Error getting users'
                });
            }
        );
};

UserController.prototype.getUserById = function(request, response) {
    var _this = this;
    UserService.getUserById(request.params.userid)
        .then(
            function onSuccess(data) {
                __getUserBySuccess.call(_this, response, data);
            },
            function onError(error) {
                __getUserByError.call(_this, response, error);
            }
        );
};

UserController.prototype.getUserByEmail = function(request, response) {
    var _this = this;
    UserService.getUserByEmail(request.params.email)
        .then(
            function onSuccess(data) {
                __getUserBySuccess.call(_this, response, data);
            },
            function onError(error) {
                __getUserByError.call(_this, response, error);
            }
        );
};

UserController.prototype.getUserByUsername = function(request, response) {
    var _this = this;
    UserService.getUserByUsername(request.params.username)
        .then(
            function onSuccess(data) {
                __getUserBySuccess.call(_this, response, data);
            },
            function onError(error) {
                __getUserByError.call(_this, response, error);
            }
        );
};

UserController.prototype.getUserBySlug = function(request, response) {
    var _this = this;
    UserService.getUserBySlug(request.params.slug)
        .then(
            function onSuccess(data) {
                __getUserBySuccess.call(_this, response, data);
            },
            function onError(error) {
                __getUserByError.call(_this, response, error);
            }
        );
};

UserController.prototype.getUserBySessionToken = function(request, response) {
    var _this = this,
        userAgent = request.get('User-Agent'),
        ipAddress = request.ip;
    UserService.getUserBySessionToken(request.params.token, userAgent, ipAddress)
        .then(
            function onSuccess(data) {
                __getUserBySuccess.call(_this, response, data);
            },
            function onError(error) {
                __getUserByError.call(_this, response, error);
            }
        );
};

UserController.prototype.createUser = function(request, response) {
    var _this = this;
    UserService.createUser(request.body)
        .then(
            function onSuccess(data) {
                _this.sendCreatedSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    created: false,
                    error: error || 'Error creating user'
                });
            }
        );
};

UserController.prototype.createSessionByPassword = function(request, response) {
    var _this = this,
        userAgent = request.get('User-Agent'),
        ipAddress = request.ip;
    UserService.createSessionByPassword(request.body.username, request.body.password, userAgent, ipAddress)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, {
                    user: new User(data.user),
                    sessionToken: new SessionToken(data.sessionToken)
                });
            },
            function onError(error) {
                if (error && (error instanceof NotFoundError)) {
                    return _this.sendNotFoundError(response, {
                        error: 'User not found'
                    });
                }
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error logging user in'
                });
            }
        );
};

UserController.prototype.resetUserPassword = function(request, response) {
    var _this = this;
    UserService.resetUserPassword(request.body.email, request.body.token)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, {
                    success: true
                });
            }
        )
        .catch(
            function onError(error) {
                if (error && (error instanceof NotFoundError)) {
                    return _this.sendNotFoundError(response, {
                        error: 'User not found'
                    });
                }
                _this.sendServerError(response, {
                    error: error || 'Error resetting password'
                });
            }
        );
};

UserController.prototype.updateUserById = function(request, response) {

};

UserController.prototype.deleteUserById = function(request, response) {

};

module.exports = UserController;