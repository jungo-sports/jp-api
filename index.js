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
        feed: require('./controllers/feed-controller'),
        checkin: require('./controllers/checkin-controller'),
        friend: require('./controllers/friend-controller'),
        poke: require('./controllers/poke-controller'),
        like: require('./controllers/like-controller'),
        push: require('./controllers/push-controller')
    },
    services: {
        user: require('./services/user-service'),
        rating: require('./services/rating-service'),
        follow: require('./services/follow-service'),
        event: require('./services/event-service'),
        search: require('./services/search-service'),
        friend: require('./services/friend-service'),
        like: require('./services/like-service'),
        code: require('./services/code-service'),
        push: require('./services/push-service')
    },
    models: {
        user: require('./models/user-model'),
        baseevent: require('./services/events/base-event'),
        eventmap: require('./services/events/event-map'),
        notificationevent: require('./models/notification-event-model')
    },
    persistence: {
        base: require('./persistence/base/base-dao'),
        code: require('./persistence/code/code-dao')
    }
};