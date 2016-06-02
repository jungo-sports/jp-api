var bcrypt = require('bcryptjs'),
    q = require('q');

function UserUtils() {};

UserUtils.prototype.getHashedPassword = function(password) {
    var deferred = q.defer();
    bcrypt.hash(password, 10, function(error, data) {
        if (error) {
            return deferred.reject('Error hashing password');
        }
        deferred.resolve(data);
    });
    return deferred.promise;
};

UserUtils.prototype.isPasswordHashValid = function(password, hash) {
    var deferred = q.defer();
    bcrypt.compare(password, hash, function(error, data) {
        if (error) {
            return deferred.reject('Error validating hashed password');
        }
        deferred.resolve(data === true);
    });
    return deferred.promise;
};

module.exports = new UserUtils();