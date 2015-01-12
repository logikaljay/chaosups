var mongoose = require('mongoose');

module.exports = function(app) {
    app.factory.items = {};

    app.factory.items.add = function(name, value, zone, fn) {
        var Item = mongoose.model('Item', app.models.item);
        var newItem = new Item({
            state: 1,
            name: name,
            zone: zone,
            minimumBid: value
        });

        newItem.save(function(err) {
            if (err) {
                console.log('app.factory.items.add ERROR: ' + err);
            }

            fn(newItem);
        });
    };
};
