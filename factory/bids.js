var mongoose = require('mongoose')
  , async = require('async')
  , util = require('util');

module.exports = function(app) {
    app.factory.bids = {};

    app.factory.bids.getByItem = function(itemId, fn) {
        var Item = mongoose.model('Item', app.models.item);
        var User = mongoose.model('User', app.models.user);
        var Bid = mongoose.model('Bid', app.models.bid);

        Bid.find({ item: itemId })
           .populate('item')
           .populate('user')
           .populate('previous')
           .exec(function(err, docs) {
            if (err) {
                console.log("app.factory.bids.getByItem ERROR: " + err);
            }

            fn(docs);
        });
    };

    app.factory.bids.place = function(item, userId, value, fn) {
        var Item = mongoose.model('Item', app.models.item);
        var User = mongoose.model('User', app.models.user);
        var Bid = mongoose.model('Bid', app.models.bid);

        // get the current user
        app.factory.users.getById(userId, function(user) {

            // check if there is currently a bid
            if (item.currentBid) {
                // roll the bid in to previous
                var oldBid = item.currentBid;
                item.previousBids.push(oldBid);

                // create a new bid
                var newBid = new Bid({
                    previous: [],
                    item: item,
                    user: user,
                    amount: value,
                    zone: item.zone
                });

                // save the bid
                newBid.save(function(err) {
                    if (err) {
                        console.log("app.factory.bids.place new bid ERROR: " + err);
                    }

                    item.currentBid = newBid;
                    item.minimumBid = Math.ceil(Number(value) * 1.10);

                    // save the item
                    item.save(function(err) {
                        if (err) {
                            console.log("app.factory.bids.place save item ERROR: " + err);
                        }

                        app.factory.items.getById(item.id, function(newItem) {
                            fn(newItem);
                        });
                    });
                })

            } else {
                // create a new bid
                var newBid = new Bid({
                    item: item,
                    user: user,
                    amount: value,
                    zone: item.zone
                });

                newBid.save(function(err) {
                    if (err) {
                        console.log("app.factory.bids.place new bid ERROR: " + err);
                    }

                    item.minimumBid = Math.ceil(Number(value) * 1.10);
                    item.currentBid = newBid;

                    item.save(function(err) {
                        if (err) {
                            console.log()
                        }

                        console.log("app.factory.bids.place item save ERROR: " + err);
                        
                        app.factory.items.getById(item.id, function(newItem) {
                            fn(newItem);
                        });
                    });
                });
            }
        });
    };
};