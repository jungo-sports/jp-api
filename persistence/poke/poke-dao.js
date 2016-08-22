var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    databaseUtils = require('../utils/database-utils'),
    dateUtils = require('../../utils/date-utils');

function Dao() {
    BaseDao.call(this);
};

util.inherits(Dao, BaseDao);

Dao.prototype.getPokeById = function(id) {
    return this.executeReadQuery(
        'SELECT * FROM pokes WHERE id = ?',
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

Dao.prototype.addPoke = function(userId, pokedId) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO pokes SET ? ON DUPLICATE KEY UPDATE `date` = VALUES(`date`)',
        {
            userid: userId,
            pokedid: pokedId,
            date: dateUtils.getUTCDate().toDate()
        }
    )
    .then(
        function onSuccess(data) {
            if (data && data.affectedRows) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error creating poke');
        },
        function onError(error) {
            deferred.reject('Error creating poke ' + databaseUtils.getErrorByCode(error.code));
        }
    );
    return deferred.promise;
};

module.exports = new Dao();