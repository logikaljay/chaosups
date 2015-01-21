var async = require('async');
var util = require('util');

module.exports = function(app) {
    app.get('/bid/:id', function(req, res) {
        var itemId = req.params.id;
        var userId = req.session.user.id;

        app.factory.items.getById(itemId, function(item) {
            app.factory.points.getAllByUserId(userId, function(points) {
                res.render('bid/index', {
                    item: item,
                    points: points });
            });
        });
    });

    app.post('/bid/:id', function(req, res) {
        var itemId = req.params.id;
        var userId = req.session.user.id;
        var value = req.body.bid;

        // get the item
        app.factory.items.getById(itemId, function(item) {
            // check if value >= minimumBid
            if (value >= item.minimumBid) {

                // check if the user actually has that many points
                app.factory.points.getAllByUserId(userId, function(points) {
                    if (points[item.zone].available >= value) {
                        var moment = app.locals.moment;

                        // place the bid
                        app.factory.bids.place(item, userId, value, function(newItem) {
                            var endDate = moment(newItem.currentBid.endDate);

                            res.json({
                                status: "ok",
                                message: "Bid placed",
                                data: {
                                    minimumBid: newItem.minimumBid,
                                    currentBid: newItem.currentBid,
                                    previousBids: newItem.previousBids,
                                    maximumBid: points[item.zone].available,
                                    endDate: endDate.format("Do MMM HH:mm:ss"),
                                    endDate_from: endDate.fromNow()
                                }
                            });
                        });

                    } else {

                        res.json({
                            status: "error",
                            message: "You don't have that many points available",
                            data: {
                                minimumBid: item.minimumBid,
                                currentBid: item.currentBid,
                                previousBids: item.previousBids
                            }
                        });

                    }
                });

            } else {

                res.json({
                    status: "error",
                    message: "Your bid was below the minimum required amount",
                    data: {
                        minimumBid: item.minimumBid,
                        currentBid: item.currentBid,
                        previousBids: item.previousBids
                    }
                });

            }
        });
    });
};
