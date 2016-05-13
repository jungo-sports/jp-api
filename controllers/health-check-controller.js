var util = require('util'),
    BaseController = require('./base-controller')

/**
 * @inheritDoc
 */
function HealthCheckController(app) {
    if (!(this instanceof HealthCheckController)) {
        return new HealthCheckController(app);
    }
    BaseController.call(this, app, {
        path: '/health-check'
    });
};

util.inherits(HealthCheckController, BaseController);

/**
 * @inheritDoc
 */
HealthCheckController.prototype.registerAllMethods = function() {
    this.registerGetMethod('/', this.getServiceStatus);
};

/**
 * Returns basic health-check status
 * 
 * @param   {Request}       request         Request object
 * @param   {Response}      response        Response object
 */
HealthCheckController.prototype.getServiceStatus = function(request, response) {
    this.sendSuccess(response, {
        running: true
    });
};

module.exports = HealthCheckController;