var userRole = require('../models/user-role-model');

/**
 * Constructor for the base controller
 *
 * @constructor
 * @param   {Object}        app             Express app
 * @param   {Object}        options         Controller options
 * @param   {String}        options.path    Base path for the service
 */
function BaseController(app, options) {
    this.app = app;
    this.options = (options instanceof Object) ? options : {};
};

function __sendResponse(code, data, response) {
    response.status(code).send(JSON.stringify(data));
};

BaseController.prototype.__registerMethod = function(method, endpoint, callback, options) {
    var _this = this;
    options = (options instanceof Object) ? options : {};
    this.app[method](this.options.path + endpoint, function(request, response) {

        var loggedInUser = (request.api) ? request.api.loggedInUser : null;

        // Endpoint requires user to be logged in
        if ((options.loggedIn || options.loggedInAs) && (!loggedInUser || !loggedInUser.id)) {
            __sendResponse(401, {
                error: 'User is not authorized to perform this action'
            }, response);
            return;
        }

        callback.call(_this, request, response);
    });
};

/**
 * Registers a new GET method in the controller
 *
 * @public
 * @param   {String}        endpoint        Endpoint to register
 * @param   {Function}      callback        Callback for when the method is called
 */
BaseController.prototype.registerGetMethod = function(endpoint, callback, options) {
    this.__registerMethod('get', endpoint, callback, options);
};

/**
 * Registers a new POST method in the controller
 *
 * @public
 * @param   {String}        endpoint        Endpoint to register
 * @param   {Function}      callback        Callback for when the method is called
 */
BaseController.prototype.registerPostMethod = function(endpoint, callback, options) {
    this.__registerMethod('post', endpoint, callback, options);
};

/**
 * Registers a new PUT method in the controller
 *
 * @public
 * @param   {String}        endpoint        Endpoint to register
 * @param   {Function}      callback        Callback for when the method is called
 */
BaseController.prototype.registerPutMethod = function(endpoint, callback, options) {
    this.__registerMethod('put', endpoint, callback, options);
};

/**
 * Registers a new DELETE method in the controller
 *
 * @public
 * @param   {String}        endpoint        Endpoint to register
 * @param   {Function}      callback        Callback for when the method is called
 */
BaseController.prototype.registerDeleteMethod = function(endpoint, callback, options) {
    this.__registerMethod('delete', endpoint, callback, options);
};

/**
 * Returns data in a JSON response
 *
 * @public
 * @param   {Response}      response        Express response object
 * @param   {Object}        data            Data to send
 */
BaseController.prototype.sendSuccess = function(response, data) {
    __sendResponse(200, data || {}, response);
};

BaseController.prototype.sendCreatedSuccess = function(response, data) {
    __sendResponse(201, data || {
        created: true
    }, response);
};

BaseController.prototype.sendServerError = function(response, data) {
    __sendResponse(500, data || {}, response);
};

BaseController.prototype.sendNotFoundError = function(response, data) {
    __sendResponse(404, data || {}, response);
};

/**
 * Abstract method to register all methods for the controller
 *
 * @protected
 */
BaseController.prototype.registerAllMethods = function() {};

/**
 * Initializes the controller and sets up all endpoints
 *
 * @public
 * @throws  {Error}         If no path parameter has been set
 */
BaseController.prototype.init = function() {
    if (typeof this.options.path !== 'string') {
        throw new Error('No path defined to start service!');
    }
    this.registerAllMethods();
};

module.exports = BaseController;