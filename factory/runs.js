var mongoose = require('mongoose');

module.exports = function(app) {
    app.factory.runs = {};

    app.factory.runs.getAll = function(fn) {
        var Run = mongoose.model('Run', app.models.run);
        var Item = mongoose.model('Item', app.models.item);
        var Point = mongoose.model('Point', app.models.point);
        var User = mongoose.model('User', app.models.user);
        
        Run.find()
           .populate("items")
           .populate("leader")
           .populate("points")
           .sort({ date: -1 })
           .limit(6)
           .exec(function(err, docs) {
            if (err) {
                console.log("app.factory.runs.getById ERROR: " + err);
            }

            var options = {
                path: 'points.user',
                model: 'User'
            };

            Run.populate(docs, options, function(err, runs) {
                fn(runs);
            });
        })
    }

    app.factory.runs.getById = function(runId, fn) {
        var Run = mongoose.model('Run', app.models.run);
        var Item = mongoose.model('Item', app.models.item);
        var Point = mongoose.model('Point', app.models.point);
        var User = mongoose.model('User', app.models.user);
        Run.findById(runId)
           .populate("items")
           .populate("leader")
           .populate("points")
           .sort({ date: -1 })
           .limit(6)
           .exec(function(err, docs) {
            if (err) {
                console.log("app.factory.runs.getById ERROR: " + err);
            }

            var options = {
                path: 'points.user',
                model: 'User'
            };

            Run.populate(docs, options, function(err, runs) {
                fn(runs);
            });
        })
    }

    app.factory.runs.getLatest = function(fn) {
        var Run = mongoose.model('Run', app.models.run);
        var Item = mongoose.model('Item', app.models.item);
        var Point = mongoose.model('Point', app.models.point);
        var User = mongoose.model('User', app.models.user);
        Run.find({})
           .populate("items")
           .populate("leader")
           .populate("points")
           .sort({ date: -1 })
           .limit(6)
           .exec(function(err, docs) {
            if (err) {
                console.log("app.factory.runs.getLatest ERROR: " + err);
            }

            var options = {
                path: 'points.user',
                model: 'User'
            };

            Run.populate(docs, options, function(err, runs) {
                fn(runs);
            });
        })
    };

    app.factory.runs.add = function(leader, users, points, items, zone, days, fn) {
        var Run = mongoose.model('Run', app.models.run);
        var run = new Run({
            state: 1,
            leader: leader,
            points: points,
            users: users,
            items: items,
            zone: zone,
            days: days
        });

        run.save(function(err) {
            if (err) {
                console.log('app.factory.runs.add ERROR: ' + err);
            }

            fn(run);
        });
    };
};
