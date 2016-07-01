var EventTypes = require('./event-types-model');

var distributionMap = {
    feed: [
        EventTypes.types.FOLLOW_ADD,
        EventTypes.types.CHECKIN_ADD
    ],
    notifications: [
        EventTypes.types.FOLLOW_ADD
    ]
}

function shouldDistributeToType(type, event) {
    return (distributionMap[type].indexOf(event.type) !== -1);
};

module.exports = {
    shouldDistributeToFeed: function(event) {
        return shouldDistributeToType('feed', event);
    },
    shouldDistributeToNotifications: function(event) {
        return shouldDistributeToType('notifications', event);
    }
};