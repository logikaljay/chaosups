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
