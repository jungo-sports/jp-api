var util = require('util'),
    q = require('q'),
    BaseDao = require('../base/base-dao'),
    userUtils = require('../../utils/user-utils');

function AuthenticationDao() {
    BaseDao.call(this);
};

util.inherits(AuthenticationDao, BaseDao);

AuthenticationDao.prototype.getAuthenticationByPassword = function(userid, password) {
    return this.executeReadQuery(
        'SELECT * FROM users_authentications WHERE ?',
        {
            userid: userid
        }
    )
    .then(
        function onSuccess(data) {
            if (!data || data.length === 0) {
                return false;
            }
            data = data[0];
            return userUtils.isPasswordHashValid(password, data.hash);
        }
    );
};

AuthenticationDao.prototype.createUserAuthentication = function(userid, password) {
    var _this = this;
    return userUtils.getHashedPassword(password)
        .then(
            function onSuccess(data) {
                return _this.executeWriteQuery(
                    'INSERT INTO users_authentications SET ?',
                    {
                        userid: userid,
                        hash: data
                    }
                );
            }
        )
        .catch(
            function onError(error) {
                var message = 'Error creating user authentication';
                error = (error instanceof Object) ? error : {};
                switch(error.code) {
                    case 'ER_NO_REFERENCED_ROW_2':
                        message += ' (no user found)';
                        break;
                    case 'ER_DUP_ENTRY':
                        message += ' (user already has password set)';
                        break;
                }
                return message;
            }
        );
};

module.exports = new AuthenticationDao();