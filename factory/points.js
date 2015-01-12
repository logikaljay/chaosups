var mongoose = require('mongoose');

module.exports = function(app) {
    app.factory.points = {};

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
            fn(null);
        } else {
            // check to see if this user has points for this zone already
            app.factory.points.get(user, zone, function(pointsEntity) {
                if (pointsEntity == null) {
                    // create the points entry
                    var Points = mongoose.model('Point', app.models.point);
                    var newPoints = new Points({
                        user: user,
                        zone: zone,
                        state: 0,
                        amount: Number(points)
                    });

                    newPoints.save(function(err) {
                        if (err) {
                            console.log('app.factory.points.add ERROR: ' + err);
                        }

                        fn(newPoints);
                    });
                } else {
                    // add the points
                    pointsEntity.amount = pointsEntity.amount + Number(points);
                    pointsEntity.save(function(err) {
                        if (err) {
                            console.log("app.factory.points.add ERROR: " + err);
                        }

                        fn(pointsEntity);
                    });
                }
            });
        }
    }; 
}
