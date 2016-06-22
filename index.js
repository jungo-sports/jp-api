module.exports = {
    middleware: {
        session: require('./middleware/session-middleware')
    },
    controllers: {
        base: require('./controllers/base-controller'),
        user: require('./controllers/user-controller'),
        rating: require('./controllers/rating-controller'),
        healthcheck: require('./controllers/health-check-controller'),
        follow: require('./controllers/follow-controller'),
        notification: require('./controllers/notification-controller'),
        feed: require('./controllers/feed-controller')
    },
    services: {
        user: require('./services/user-service'),
        rating: require('./services/rating-service'),
        follow: require('./services/follow-service'),
        event: require('./services/event-service'),
        search: require('./services/search-service')
    },
    models: {
        user: require('./models/user-model')
    },
    persistence: {
        base: require('./persistence/base/base-dao')
    }
};