var mongoose = require('mongoose');
var async = require('async');

module.exports = function(app) {
    app.get('/', app.libs.restrict, function(req, res){
        // load user points and inject into the session
        _getRuns(req, function(runs, points, items, bids) {
            res.render('index', { runs: runs, points: points, items: items, bids: bids });
        });
    });

    app.get('/restricted', app.libs.restrict, function(req, res) {
        res.send('Wahoo! restricted area. click to <a href="/logout">logout</a>');
    });

    _getRuns = function(req, fn) {
        app.factory.runs.getLatest(function(runs) {
            _getPoints(req, runs, fn);
        });
    };

    _getPoints = function(req, runs, fn) {
        var userId = req.session.user.id;

        app.factory.points.getAllByUserId(userId, function(points) {
            _getBids(req, runs, points, fn);
        });
    };

    _getBids = function(req, runs, points, fn) {
        var userId = req.session.user.id;

        app.factory.bids.getAllByUserId(userId, function(bids) {
            _getItems(req, runs, points, bids, fn);
        })
    };

    _getItems = function(req, runs, points, bids, fn) {
        app.factory.items.getLatest(function(items) {
            fn(runs, points, items, bids);
        });
    };
};
