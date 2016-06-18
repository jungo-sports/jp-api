var _ = require('lodash'),
    q = require('q'),
    apiConfig = require('../utils/api-config'),
    elasticsearch = require('elasticsearch');

function SearchService() {
    var _this = this;
    if (!apiConfig.has('services.elasticsearch')) {
        return;
    }
    this.client = new elasticsearch.Client(
        {
            host: apiConfig.get('services.elasticsearch.host'),
            defaults: {
                index: apiConfig.get('services.elasticsearch.index')
            }
        }
    );
    this.client.indices.exists(
        {
            index: apiConfig.get('services.elasticsearch.index')
        }
    )
    .then(
        function onCheckIndexSuccess(exists) {
            if (exists) {
                return exists;
            }
            _this.client.indices.create(
                {
                    index: apiConfig.get('services.elasticsearch.index')
                }
            );
        }
    )
    .then(
        function onCreateIndexSuccess(data) {
            return __generateAllMappings(_this.client);
        }
    )
    .catch(
        function onError(error) {
            console.error(error);
        }
    );
};

function __generateAllMappings(client) {
    return q.all(
        _.mapKeys(apiConfig.get('services.elasticsearch.mappings'), function(path, type) {
            var mapping = require(path);
            if (!mapping) {
                return false;
            }
            return client.indices.putMapping(
                {
                    type: type,
                    body: mapping
                }
            );
        })
    );
};

function __getUnavailablePromise() {
    var deferred = q.defer();
    deferred.reject('No elasticsearch client configured');
    return deferred.promise;
};

SearchService.prototype.search = function(type, body) {
    if (!this.client) {
        return __getUnavailablePromise();
    }
    return this.client.search(
        {
            type: type,
            body: body
        }
    );
};

SearchService.prototype.putDocument = function(type, body) {
    if (!this.client) {
        return __getUnavailablePromise();
    }
    return this.client.index(
        {
            index: apiConfig.get('services.elasticsearch.index'),
            type: type,
            body: body
        }
    )
    .then(
        function onSuccess(data) {
            console.log(data);
        },
        function onError(error) {
            console.error(error);
        }
    );
};

module.exports = new SearchService();