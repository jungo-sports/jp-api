var _ = require('lodash'),
    q = require('q'),
    util = require('util'),
    BaseController = require('./base-controller');

function CheckinController(app) {
    if (!(this instanceof CheckinController)) {
        return new CheckinController(app);
    }
    BaseController.call(this, app, {
        path: '/checkins'
    });
};

util.inherits(CheckinController, BaseController);

CheckinController.prototype.registerAllMethods = function() {

    this.registerPostMethod('/', this.addCheckin);

};

CheckinController.prototype.addCheckin = function(request, response) {
    var _this = this,
        userId = request.body.userid;

    
};

module.exports = CheckinController;