var util = require('util'),
    BaseController = require('./base-controller'),
    PushService = require('../services/push-service');

function PushController(app) {
    if (!(this instanceof PushController)) {
        return new PushController(app);
    }
    BaseController.call(this, app, {
        path: '/push'
    });
};

util.inherits(PushController, BaseController);

PushController.prototype.registerAllMethods = function() {
    this.registerGetMethod('/test', this.test);
};

PushController.prototype.test = function(request, response) {
    var _this = this,
        options = {
            payload: {
                foo: 'bar'
            }
        }
    PushService.sendNotification(38, options)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting feed'
                });
            }
        );
};

module.exports = PushController;