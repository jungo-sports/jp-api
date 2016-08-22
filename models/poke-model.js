var _ = require('lodash');

function Poke(data) {
    data = (data instanceof Object) ? data : {};
    return _({
        id: data.id,
        userId: data.userid,
        pokedId: data.pokedid,
        date: data.date,
        user: data.user || undefined,
        pokedUser: data.pokeduser || undefined
    }).omitBy(_.isUndefined).value();
}

module.exports = Poke;