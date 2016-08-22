var util = require('util'),
    BaseController = require('./base-controller'),
    PokeService = require('../services/poke-service');

function PokeController(app) {
    if (!(this instanceof PokeController)) {
        return new PokeController(app);
    }
    BaseController.call(this, app, {
        path: '/pokes'
    });
};

util.inherits(PokeController, BaseController);

PokeController.prototype.registerAllMethods = function() {

    this.registerPostMethod('/', this.addPoke);
};

PokeController.prototype.addPoke = function(request, response) {
    var _this = this,
        userId = request.body.userid,
        pokedId = request.body.pokedid;

    PokeService.addPoke(userId, pokedId)
        .then(
            function onSuccess(data) {
                _this.sendSuccess(response, data);
            },
            function onError(error) {
                if (error && (error instanceof Error)) {
                    error = error.message;
                }
                _this.sendServerError(response, {
                    error: error || 'Error adding poke'
                });
            }
        );
};

module.exports = PokeController;