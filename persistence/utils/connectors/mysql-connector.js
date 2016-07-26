var fs = require('fs'),
    mysql = require('mysql'),
    q = require('q');

function MySqlConnector() {
    
};

function __executeQuery(pool, query, values) {
    var _this = this,
        deferred = q.defer();
    pool.getConnection(function onPoolConnection(error, connection) {
        if (error) {
            return deferred.reject(
                '\nError connecting to pool while running query...\n' + query + '\nError: ' + JSON.stringify(error)
            );
        }
        console.log(mysql.format(query, values));
        connection.query(query, values || [], function (error, rows) {
            connection.release();
            if (error) {
                return deferred.reject(error);
            }
            deferred.resolve(rows);
        });
    });
    return deferred.promise;
};

MySqlConnector.prototype.createReadPool = function(host, username, password, database) {
    if (this.readPool) {
        return;
    }
    this.readPool = mysql.createPool({
        host: host,
        user: username,
        password: password,
        database: database
    });
    this.executeReadQuery('SELECT 1')
        .then(
            function onReadQuerySuccess(data) {},
            function onReadQueryError(error) {
                console.error(error);
            }
        );
};

MySqlConnector.prototype.createWritePool = function(host, username, password, database) {
    if (this.writePool) {
        return;
    }
    this.writePool = mysql.createPool({
        host: host,
        user: username,
        password: password,
        database: database,
        multipleStatements: true
    });
    this.executeWriteQuery('SELECT 1')
        .then(
            function onWriteQuerySuccess(data) {},
            function onWriteQueryError(error) {
                console.error(error);
            }
        );
};

MySqlConnector.prototype.executeReadQuery = function(query, values) {
    if (!this.readPool) {
        console.warn('No read pool defined for query %s, attempting to use write pool.', JSON.stringify(query));
        if (!this.writePool) {
            throw new Error('Write pool fallback not defined!');
        }
    }
    return __executeQuery(this.readPool, query, values);
};

MySqlConnector.prototype.executeWriteQuery = function(query, values) {
    if (!this.writePool) {
        throw new Error('No write pool defined for query %s!', JSON.stringify(query));
    }
    return __executeQuery(this.writePool, query, values);
};

MySqlConnector.prototype.executeWriteScript = function(path) {
    var file = fs.readFileSync(path, "utf8");
    return this.executeWriteQuery(file);
}

module.exports = new MySqlConnector();