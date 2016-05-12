var path = require('path'),
    apiConfig = require('../../utils/api-config'),
    mysqlReadCredentials = apiConfig.get('services.mysql.read'),
    mysqlReadWriteCredentials = apiConfig.get('services.mysql.readwrite'),
    MySqlConnector = require('../utils/connectors/mysql-connector');

function BaseDao() {
    if (!MySqlConnector.readPool) {
        MySqlConnector.createReadPool(
            mysqlReadCredentials.host,
            mysqlReadCredentials.username,
            mysqlReadCredentials.password,
            mysqlReadCredentials.database
        );
    }
    if (!MySqlConnector.writePool) {
        MySqlConnector.createWritePool(
            mysqlReadWriteCredentials.host,
            mysqlReadWriteCredentials.username,
            mysqlReadWriteCredentials.password,
            mysqlReadWriteCredentials.database
        );
        __executeStartupScripts();
    }
};

function __executeStartupScripts() {
    MySqlConnector.executeWriteScript(path.resolve(__dirname, 'resources', 'init.sql'))
        .then(
            function onStartupExecuteSuccess(data) {},
            function onStartupExecuteError(error) {
                console.error('\nError executing startup script for UserDao...', error);
            }
        );
}

BaseDao.prototype.executeReadQuery = function(query, values) {
    return MySqlConnector.executeReadQuery(query, values);
};

BaseDao.prototype.executeWriteQuery = function(query, values) {
    return MySqlConnector.executeWriteQuery(query, values);
};

module.exports = BaseDao;