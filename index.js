var express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express(),
    healthCheckController = require('./controllers/health-check-controller')(app),
    userController = require('./controllers/user-controller')(app),
    ratingController = require('./controllers/rating-controller')(app),
    sessionMiddleware = require('./middleware/session-middleware');

app.use(cors());
app.use(bodyParser.json());
app.use(sessionMiddleware);

healthCheckController.init();
userController.init();
ratingController.init();

function start(options) {
    options = (options instanceof Object) ? options : {};

    var port = options.port || 3000;

    app.listen(port, function() {
        console.log('JP API listening on port ' + port);
    });
};

module.exports = {
    start: start,
    middleware: {
        session: sessionMiddleware
    }
};