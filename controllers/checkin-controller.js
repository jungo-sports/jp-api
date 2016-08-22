var _ = require('lodash'),
    q = require('q'),
    util = require('util'),
    BaseController = require('./base-controller'),
    CheckinService = require('../services/checkin-service'),
    Checkin = require('../models/checkin-model');

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

    this.registerGetMethod('/user/id/:userid', this.getCheckins);

};

CheckinController.prototype.addCheckin = function(request, response) {
    var _this = this,
        checkin = new Checkin(request.body || {});

    CheckinService.addCheckinEvent(checkin.userid, checkin.type, checkin)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error adding checkin event'
                });
            }
        );
};

CheckinController.prototype.getCheckins = function(request, response) {
    var _this = this,
        userId = request.params.userid,
        offset = parseInt(request.query.offset || 0),
        limit = parseInt(request.query.limit || 20);
    CheckinService.getCheckinsByUserId(userId, offset, limit)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error getting checkins'
                });
            }
        );
};


module.exports = CheckinController;