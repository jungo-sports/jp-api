var q = require('q');

function BaseEventDistributor() {
    this.type = '';
    this.eventTypes = require('../../../models/event-types-model');
};

function __getEmptyDistributionList() {
    var deferred = q.defer();
    deferred.resolve([]);
    return deferred.promise;
};

BaseEventDistributor.prototype.getUserFeedDistribution = function(event) {
    return __getEmptyDistributionList();
};

BaseEventDistributor.prototype.getUserNotificationsDistribution = function(event) {
    return __getEmptyDistributionList();
};

BaseEventDistributor.prototype.getService = function(service) {
    return require('../../' + service);
}

module.exports = BaseEventDistributor;