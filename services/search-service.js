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
            console.error('Error initializing ElasticSearch', error);
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

SearchService.prototype.search = function(type, body, options) {
    if (!this.client) {
        return __getUnavailablePromise();
    }
    var _this = this;
    return this.client.search(
        {
            type: type,
            body: body,
            index: apiConfig.get('services.elasticsearch.index')
        }
    )
    .then(
        function onSuccess(data) {
            if (options && options.parsed) {
                return _this.getParsedResults(data);
            }
            return data;
        }
    );
};

SearchService.prototype.getDocuments = function () {
    var _this = this;

    if (!this.client) {
        return __getUnavailablePromise();
    }

    return this.client.search(
        {
            type: 'user',
            index: apiConfig.get('services.elasticsearch.index'),
            body: {
                // query: {
                //     "match_all": {}
                // }
                query: {
                    match: {
                        role: 3
                    }
                }
            },
            size: 10000 
        }
    )
    .then(
        function onSuccess(data) {
            return _this.getParsedResults(data);
        }
    )
    .catch(error => {
        console.log('errrooorororor', error);
    })
}

SearchService.prototype.deleteDocument = function(type, id) {
    if (!this.client) {
        return __getUnavailablePromise();
    }
    return this.client.delete(
        {
            index: apiConfig.get('services.elasticsearch.index'),
            type: type,
            id: id
        }
    );
};

SearchService.prototype.createDocument = function(type, body) {
    if (!this.client) {
        return __getUnavailablePromise();
    }
    return this.client.index(
        {
            index: apiConfig.get('services.elasticsearch.index'),
            type: type,
            body: body,
            id: body.id
        }
    );
};

SearchService.prototype.replaceDocumentByQuery = function(type, query, body) {
    if (!this.client) {
        return __getUnavailablePromise();
    }
    var _this = this;
    return this.client.search(
        {
            index: apiConfig.get('services.elasticsearch.index'),
            type: type,
            body: {
                query: query
            }
        }
    )
    .then(
        function onSuccess(data) {
            return q.all(
                _.map(data.hits.hits, function(hit) {
                    return _this.client.delete(
                        {
                            index: apiConfig.get('services.elasticsearch.index'),
                            type: type,
                            id: hit._id
                        }
                    );
                })
            )
            .then(
                function onSuccess(data) {
                    return _this.createDocument(type, body);
                }
            );
        }
    )
    .catch(
        function onError(error) {
            console.error(error);
        }
    );
};

SearchService.prototype.getParsedResults = function(results) {
    if (!results || !results.hits || !results.hits.hits) {
        return [];
    }
    return _.map(results.hits.hits, function(hit) {
        return hit._source;
    });
};

module.exports = new SearchService();
