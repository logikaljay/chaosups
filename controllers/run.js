var util = require('util');

module.exports = function(app) {
    app.get('/run', app.libs.restrict, function(req, res) {
        res.redirect('/run/list');
    });

    app.get('/run/list', app.libs.restrict, function(req, res) {
        // to be implmented
    });

    app.get('/run/create', app.libs.restrict, function(req, res) {
        var zones = [
        {
            name: 'zone1',
            days: [
            {
                name: "1",
                amount: 10
            }]
        },{
            name:'zone2',
            days: [
            {
                name: "1",
                amount: 10
            },{
                name: "2",
                amount: 5
            }, {
                name: "3",
                amount: 7
            }]
        }];

        var users = ['jay', 'bob', 'jim', 'paul', 'smith'];

        res.render('run/create', { zones: zones, users: users });
    });

    app.post('/run/create', app.libs.restrict, function(req, res) {
        var zone = req.body.zone;
        var days = req.body.days;
        var users = req.body.users;
        var items = req.body.items;

        // construct the temp run
        var run = {
            zone: zone,
            days: days,
            users: users,
            items: items
        };

        // save the temp run to the session
        req.session.run = run;

        // redirect to run/confrim
        res.redirect('/run/confirm');
    });

    app.get('/run/confirm', app.libs.restrict, function(req, res) {
        // load the temp run from the session
        var run = req.session.run;
        if (run !== undefined) {
            res.render('run/confirm', { run: run });
        }
    });

    app.post('/run/confirm', app.libs.restrict, function(req, res) {
        // to be implemented
    });
};
