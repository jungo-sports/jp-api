var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function Dao() {
    BaseDao.call(this);
};

util.inherits(Dao, BaseDao);

Dao.prototype.getById = function(id) {
    return this.executeReadQuery(
        'SELECT * FROM codes WHERE id = ?',
        [
            id
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return undefined;
            }
            return data[0];
        }
    );
};

Dao.prototype.getByCode = function(code) {
    return this.executeReadQuery(
        'SELECT * FROM codes WHERE code = ?',
        [
            code
        ]
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return undefined;
            }
            return data[0];
        }
    );
};

Dao.prototype.addCode = function(code, expiration, extra) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO codes SET ?',
        {
            code: code,
            expires: expiration,
            extra: extra
        }
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error adding code');
        },
        function onError(error) {
            deferred.reject('Error adding code ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

module.exports = new Dao();