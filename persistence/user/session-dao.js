var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao');

function SessionDao() {
    BaseDao.call(this);
};

util.inherits(SessionDao, BaseDao);

SessionDao.prototype.getSessionByCriteria = function(criteria) {
    criteria = (criteria instanceof Object) ? criteria : {};
    return this.executeReadQuery(
        'SELECT * FROM users_sessions WHERE ?',
        criteria
    )
    .then(
        function onSuccess(data) {
            return (data && data.length > 0) ? data[0] : {};
        },
        function onError(error) {
            return 'Error looking up user by criteria';
        }
    );
};

SessionDao.prototype.createSessionForUser = function(userid, token, expires, useragent, ipaddress) {
    var deferred = q.defer();
    this.executeWriteQuery(
        'INSERT INTO users_sessions SET ?',
        {
            userid: userid,
            token: token,
            expires: expires,
            useragent: useragent,
            ipaddress: ipaddress
        }
    )
    .then(
        function onSuccess(data) {
            if (data && data.insertId) {
                return deferred.resolve({
                    id: data.insertId
                });
            }
            deferred.reject('Unknown error creating session');
        },
        function onError(error) {
            var message = 'Error creating session';
            error = (error instanceof Object) ? error : {};
            switch(error.code) {
                case 'ER_BAD_NULL_ERROR':
                    message += ' (invalid values specified)';
                    break;
            }
            deferred.reject(message);
        }
    );
    return deferred.promise;
};

module.exports = new SessionDao();