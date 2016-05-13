module.exports = {
    middleware: {
        session: require('./middleware/session-middleware')
    },
    controllers: {
        user: require('./controllers/user-controller'),
        rating: require('./controllers/rating-controller'),
        healthcheck: require('./controllers/health-check-controller')
    },
    services: {
        user: require('./services/user-service'),
        rating: require('./services/rating-service')
    }
};