var q = require('q'),
    util = require('util'),
    BaseEvent = require('./base-event');

function Event() {
    BaseEvent.call(this);
    this.type = this.eventTypes.POKE_ADD;
    this.pokeService = this.getService('poke-service');
    this.userService = this.getService('user-service');
};

util.inherits(Event, BaseEvent);

Event.prototype.getUserNotificationsDistribution = function(event) {
    var deferred = q.defer();
    this.pokeService.getPokeById(event.entity)
        .then(
            function onSuccess(data) {
                if (!data || !data.pokedId) {
                    return deferred.resolve([]);
                }
                return deferred.resolve([data.pokedId]);
            }
        );
    return deferred.promise;
};

Event.prototype.getActionForEvent = function(event) {
    var _this = this,
        deferred = q.defer(),
        pokeEvent = {};
    this.pokeService.getPokeById(event.entity)
        .then(
            function onSuccess(data) {
                if (!data || !data.userId || !data.pokedId) {
                    return deferred.resolve(pokeEvent);
                }
                pokeEvent = data;
                return q.all(
                    [
                        _this.userService.getUserById(data.userId),
                        _this.userService.getUserById(data.pokedId)
                    ]
                );
            }
        )
        .then(
            function onSuccess(data) {
                var Poke = _this.getModel('poke-model');

                // Passing in the full user, no need for their IDs in the root
                // object anymore
                pokeEvent.userid = undefined;
                pokeEvent.pokedid = undefined;
                pokeEvent.user = data[0];
                pokeEvent.pokeduser = data[1];

                deferred.resolve(new Poke(pokeEvent));
            }
        );
    return deferred.promise;
};

module.exports = Event;