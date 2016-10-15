var _ = require('lodash'),
    q = require('q'),
    apn = require('apn'),
    PushDao = require('../persistence/push/push-dao');

function PushService() {};

function getApnNotification(options) {
    var note = new apn.Notification();
    note.expiry = options.expiry || Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    note.badge = options.badge || 1;
    note.sound = options.sound || 'ping.aiff';
    note.alert = options.alert || 'You have a new message';
    note.payload = options.payload || { };
    return note;
};

PushService.prototype.setApnCredentials = function(apnCredentials) {
    this.apnAppBundleId = apnCredentials.appBundleId;
    this.apnProvider = new apn.Provider(
        {
            token: {
                key: apnCredentials.key,
                keyId: apnCredentials.keyId,
                teamId: apnCredentials.teamId
            },
            production: false
        }
    );
};

PushService.prototype.sendNotification = function(userId, options) {
    if (!(options instanceof Object)) {
        throw new Error('Invalid options specified to send push notification');
    }
    var apnProvider = this.apnProvider,
        apnAppBundleId = this.apnAppBundleId;
    return PushDao.getDevicesByUserId(userId)
        .then(
            function onGetDevices(data) {
                var ios = _.find(data, { os: 'ios' }),
                    android = _.find(data, { os: 'android' }),
                    iosExists = ios !== undefined,
                    androidExists = android !== undefined,
                    methods = [];

                if (iosExists) {
                    var note = getApnNotification(options);
                    note.topic = apnAppBundleId;
                    methods.push(
                        apnProvider.send(note, ios.token)
                    );
                }

                return q.all(methods);
            }
        );
};

module.exports = new PushService();