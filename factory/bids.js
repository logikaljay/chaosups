var mongoose = require('mongoose')
  , async = require('async')
  , util = require('util');

module.exports = function(app) {
    app.factory.bids = {};

    app.factory.bids.getAllByUserId = function(userId, fn) {
        var Item = mongoose.model('Item', app.models.item);
        var User = mongoose.model('User', app.models.user);
        var Bid = mongoose.model('Bid', app.models.bid);

        Bid.find({ user: userId })
           .populate('item')
           .populate('user')
           .exec(function(err, docs) {
            if (err) {
                console.log("app.factory.bids.getByItem ERROR: " + err);
            }

            fn(docs);
        });
    };

    app.factory.bids.getByItem = function(itemId, fn) {
        var Item = mongoose.model('Item', app.models.item);
        var User = mongoose.model('User', app.models.user);
        var Bid = mongoose.model('Bid', app.models.bid);

        Bid.find({ item: itemId })
           .populate('item')
           .populate('user')
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
        var moment = app.locals.moment;
        
        // get the current user
        app.factory.users.getById(userId, function(user) {

            // check if there is currently a bid
            if (item.currentBid) {
                // roll the bid in to previous
                var oldBid = item.currentBid;
                item.previousBids.push(oldBid);

                // check if someone is bidding in the last 12 hours
                var endDate = oldBid.endDate;
                var secondsRemaining = moment(endDate).seconds() - moment().seconds();
                if (secondsRemaining <= (60 * 60 * 12)) {
                    endDate = moment().add('1', 'd');
                }

                // create a new bid
                var newBid = new Bid({
                    previous: [],
                    item: item,
                    user: user,
                    amount: value,
                    zone: item.zone,
                    endDate: endDate
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
                });

            } else {
                // create a new bid
                var newBid = new Bid({
                    item: item,
                    user: user,
                    amount: value,
                    zone: item.zone,
                    endDate: app.locals.moment().add(3, 'd')
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