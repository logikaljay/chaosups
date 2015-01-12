var mongoose = require('mongoose');

module.exports = function(app) {
    app.factory.points = {};

    app.factory.points.getAllByUserId = function(id, fn) {
        var Run = mongoose.model('Run', app.models.run);
        var Points = mongoose.model('Point', app.models.point);
        var User = mongoose.model('User', app.models.user);

        Run.find()
            .populate("points")
            .exec(function(err, docs) {
            if (err) {
                console.log("app.facotry.points.getAllByUser ERROR: " + err);
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

                runs.map(function(run) {
                    run.points.map(function(point) {
                        if (point.user !== null && point.user._id == id) {
                            if (points[point.zone] == undefined) {
                                points[point.zone] = 0;
                            }

                            /*
                            if (points[point.zone][point.state] == undefined) {
                                points[point.zone][point.state] = 0;
                            }*/
                            
                            console.log("adding " + point.amount + " to " + point.zone);
                            points[point.zone] += Number(point.amount);
                        }
                    });
                });

                fn(points);
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
        } else {
            // create the points entry
            var Points = mongoose.model('Point', app.models.point);
            var newPoints = new Points({
                user: user,
                zone: zone,
                state: 1,
                amount: Number(points)
            });

            console.log('saving newPoints: ' + newPoints);
            newPoints.save(function(err) {
                if (err) {
                    console.log('app.factory.points.add ERROR: ' + err);
                }

                fn(newPoints);
            });
        }
    };
}
