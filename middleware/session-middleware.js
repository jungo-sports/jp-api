var UserService = require('../services/user-service');

function SessionMiddleware(request, response, next) {
    var token = request.get('Authorization'),
        userAgent = request.get('User-Agent'),
        ipAddress = request.ip,
        tokenParts;

    request.api = request.api || {};

    if (!token) {
        return next();
    }
    tokenParts = token.split(' ');
    token = tokenParts[tokenParts.length - 1];
    UserService.getUserBySessionToken(token, userAgent, ipAddress)
        .then(
            function onSuccess(data) {
                if (data && data.id) {
                    request.api.loggedInUser = data;
                }
                next();
            }
        )
        .catch(
            function onError(error) {
                next();
            }
        );
}

module.exports = SessionMiddleware;