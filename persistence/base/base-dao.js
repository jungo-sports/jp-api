var path = require('path'),
    apiConfig = require('../../utils/api-config'),
    mysqlReadCredentials = apiConfig.get('services.mysql.read'),
    mysqlReadWriteCredentials = apiConfig.get('services.mysql.readwrite'),
    autoDLL = apiConfig.get('services.mysql.autodll'),
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
        if (autoDLL === 'create') {
            this.executeScript(path.resolve(__dirname, 'resources', 'init.sql'));
        }
    }
};

BaseDao.prototype.executeScript = function(scriptPath) {
    MySqlConnector.executeWriteScript(scriptPath)
        .then(
            function onStartupExecuteSuccess(data) {},
            function onStartupExecuteError(error) {
                console.error('\nError executing script at path', scriptPath, error);
            }
        );
};

BaseDao.prototype.executeReadQuery = function(query, values) {
    return MySqlConnector.executeReadQuery(query, values);
};

BaseDao.prototype.executeWriteQuery = function(query, values) {
    return MySqlConnector.executeWriteQuery(query, values);
};

module.exports = BaseDao;