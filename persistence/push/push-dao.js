var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function Dao() {
    BaseDao.call(this);
};

util.inherits(Dao, BaseDao);

Dao.prototype.getDevicesByUserId = function(userId) {
    return this.executeReadQuery(
        'SELECT * FROM devices WHERE userid = ?',
        [
            userId
        ]
    );
};

module.exports = new Dao();