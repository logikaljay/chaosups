var mongoose = require('mongoose');

module.exports = function(app) {
    app.factory.runs = {};

    app.factory.runs.add = function(leader, users, points, items, zone, fn) {
        var Run = mongoose.model('Run', app.models.run);
        var run = new Run({
            state: 1,
            leader: leader,
            points: points,
            users: users,
            items: items,
            zone: zone
        });

        run.save(function(err) {
            if (err) {
                console.log('app.factory.runs.add ERROR: ' + err);
            }

            fn(run);
        });
    };
};
