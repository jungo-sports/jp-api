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

app.listen(3000, function() {
    console.log('Server listening on port 3000');
});

module.exports = app;