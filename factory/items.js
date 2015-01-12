var mongoose = require('mongoose');

module.exports = function(app) {
    app.factory.items = {};
    
    app.factory.items.getById = function(itemId, fn) {
        var Item = mongoose.model('Item', app.models.item);
        var Bid = mongoose.model('Bid', app.models.bid);
        Item.findById(itemId)
            .sort({ updatedAt: -1 })
            .populate('currentBid')
            .populate('previousBids')
            .exec(function(err, doc) {
            if (err) {
                console.log('app.factory.items.getByState ERROR: ' + err);
            }

            var options = {
                path: 'currentBid.user',
                model: 'User'
            };

            Item.populate(doc, options, function(err, item) {
                var options = {
                    path: 'previousBids.user',
                    model: 'User'
                };

                Item.populate(item, options, function(err, result) {
                    console.log(result);
                    fn(result);
                });
            });
        });
    };

    app.factory.items.getByState = function(state, fn) {
        var Item = mongoose.model('Item', app.models.item);
        var Bid = mongoose.model('Bid', app.models.bid);
        Item.find({ state: state })
            .sort({ updatedAt: -1 })
            .populate('currentBid')
            .exec(function(err, docs) {
            if (err) {
                console.log('app.factory.items.getByState ERROR: ' + err);
            }

            fn(docs);
        });
    }

    app.factory.items.getLatest = function(fn) {
        var Item = mongoose.model('Item', app.models.item);
        Item.find({})
            .limit(6)
            .sort({ updatedAt: -1 })
            .exec(function(err, docs) {
            if (err) {
                console.log('app.factory.items.getLatest ERROR: ' + err);
            }

            fn(docs);
        });
    };

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
