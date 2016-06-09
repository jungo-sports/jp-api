var NotificationDao = require('../persistence/notification/notification-dao');

function NotificationService() {};

NotificationService.prototype.addEvent = function(event) {
    return NotificationDao.addEvent(event.type, event.entity, event.extra);
};

NotificationService.prototype.removeEvent = function(event) {
    return NotificationDao.removeEvent(event.type, event.entity);
};

module.exports = new NotificationService();