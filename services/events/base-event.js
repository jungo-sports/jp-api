var q = require('q');

function BaseEvent() {
    this.type = '';
    this.eventTypes = require('../../models/event-types-model');
};

function __getEmptyDistributionList() {
    var deferred = q.defer();
    deferred.resolve([]);
    return deferred.promise;
};

function __getEmptyAction() {
    var deferred = q.defer();
    deferred.resolve({});
    return deferred.promise;
};

BaseEvent.prototype.getUserFeedDistribution = function(event) {
    return __getEmptyDistributionList();
};

BaseEvent.prototype.getUserNotificationsDistribution = function(event) {
    return __getEmptyDistributionList();
};

BaseEvent.prototype.getActionForEvent = function(event) {
    return __getEmptyAction();
};

BaseEvent.prototype.getService = function(service) {
    return require('../' + service);
}

BaseEvent.prototype.getModel = function(model) {
    return require('../../models/' + model);
}

module.exports = BaseEvent;