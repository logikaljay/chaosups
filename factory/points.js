var mongoose = require('mongoose');
var async = require('async');

module.exports = function(app) {
    app.factory.points = {};

    app.factory.points.getAllByUserId = function(userId, fn) {
        var Run = mongoose.model('Run', app.models.run);
        var Points = mongoose.model('Point', app.models.point);
        var User = mongoose.model('User', app.models.user);
        var Bid = mongoose.model('Bid', app.models.bid);

        Run.find()
            .populate("points")
            .exec(function(err, docs) {
            if (err) {
                console.log("app.factory.points.getAllByUser ERROR: " + err);
            }

            var options = {
                path: 'points.user',
                model: 'User'
            };

            Run.populate(docs, options, function(err, runs) {
                if (err) {
                    console.log("app.factory.points.getAllByUser populate ERROR: " + err);
                }

                var points = [];
        		// create a property foreach zone on the points array
        		app.factory.zones.map(function(zone) {
                    points[zone.name] = {};
        		    points[zone.name].total = 0;
        		    points[zone.name].available = 0;
        		    points[zone.name].unapproved = 0;
        		    points[zone.name].used = 0;
        		});

                var tmpPoints = [];
                async.forEach(runs, function(run, callback) {
                    tmpPoints = tmpPoints.concat(run.points);
                    callback();
                }, function(err) {
                    async.forEach(tmpPoints, function(point, callback) {
                        console.log(point.user._id + " - " + userId);
                        if (point.user !== null && point.user._id.equals(userId)) {
                            if (points[point.zone] === undefined) {
                                points[point.zone] = {};
                            }

                            // Total points that would be available if no bids have been made
                            if (points[point.zone].total === undefined) {
                                points[point.zone].total = 0;
                            }

                            // Available points that are able to be spent at this moment
                            if (points[point.zone].available === undefined) {
                                points[point.zone].available = 0;
                            }

                            // Unapproved points that are waiting to be approved from runs
                            if (points[point.zone].unapproved === undefined) {
                                points[point.zone].unapproved = 0;
                            }

                            // Used points that have been used by bids, or spent points
                            if (points[point.zone].used === undefined) {
                                points[point.zone].used = 0;
                            }

                            if (points[point.zone].spent === undefined) {
                                points[point.zone].spent = 0;
                            }

                            // Point state 0 == approved
                            if (point.state === 0) {
                                points[point.zone].available += Number(point.amount);
                                points[point.zone].total += Number(point.amount);
                            }

                            // Point state 1 == unapproved
                            if (point.state == 1) {
                                points[point.zone].unapproved += Number(point.amount);
                            }

                            // Point state 2 == spent
                            if (point.state == 2) {
                                points[point.zone].spent += Number(point.amount);
                            }

                            callback();
                        } else {
                            callback();
                        }
                    }, function(err) {
                        // now we have our points array - get points that have been used by current bids
                        app.factory.bids.getAllByUserId(userId, function(bids) {
                            async.forEach(bids, function(bid, callback) {
                                points[bid.zone].used = bid.amount;
                                points[bid.zone].available = points[bid.zone].available - bid.amount;
                                callback();
                            }, function(err) {
                                // now get all the points spent on finished bids
                                app.factory.bids.getAllFinishedByUserId(userId, function(finishedBids) {
                                    async.forEach(finishedBids, function(bid, callback) {
                                        points[bid.zone].spent += bid.amount;
                                        points[bid.zone].available = points[bid.zone].available - bid.amount;
                                        points[bid.zone].total = points[bid.zone].total - bid.amount;
                                        callback();
                                    }, function(err) {
                                        fn(points);
                                    });
                                });
                            });
                        });

                    });
                });
            });
        });
    };

    app.factory.points.get = function(user, zone, fn) {
        var Points = mongoose.model('Point', app.models.point);
        Points.findOne({ user: user }, function(err, doc) {
            if (err) {
                console.log("app.factory.points.get ERROR: " + err);
            }

            fn(doc);
        });
    };

    app.factory.points.add = function(user, zone, points, fn) {
        if (user == null) {
            console.log("app.factory.points.add ERROR: user was null");
            fn(null);
        } else if (user == false) {
            console.log("app.factory.points.add ERROR: user was not a user");
            fn(null);
        } else {
            // create the points entry
            var Points = mongoose.model('Point', app.models.point);
            var newPoints = new Points({
                user: user,
                zone: zone,
                state: 1,
                amount: Number(points)
            });

            newPoints.save(function(err) {
                if (err) {
                    console.log('app.factory.points.add ERROR: ' + err);
                }

                fn(newPoints);
            });
        }
    };
}
