var _ = require('lodash'),
    q = require('q'),
    PokeDao = require('../persistence/poke/poke-dao'),
    Poke = require('../models/poke-model'),
    EventService = require('./event-service');

function PokeService() {};

PokeService.prototype.getPokeById = function(id) {
    return PokeDao.getPokeById(id)
        .then(
            function onSuccess(data) {
                return new Poke(data);
            }
        );
};

PokeService.prototype.addPoke = function(userId, pokedId) {
    return PokeDao.addPoke(userId, pokedId)
        .then(
            function onSuccess(data) {
                return PokeDao.getPokeById(data.id);
            }
        )
        .then(
            function onSuccess(data) {
                EventService.publishEvent(EventService.keys.POKE_ADD, new Poke(data));
                return data;
            }
        );
};

module.exports = new PokeService();