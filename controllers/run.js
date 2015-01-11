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
        console.log(req.body.days.toString());

        var zone = req.body.zone,
            tmpDays = req.body.days.toString(),
            users = req.body.users,
            items = req.body.items,
            points = 0,
            days = [];

        tmpDays = tmpDays.split(",");
        console.log(tmpDays);
        tmpDays.forEach(function(day) {
            day = day.toString().split("|");
            days.push({ name: day[0], amount: day[1] });
            points += Number(day[1]);
        });
        console.log(days);

        // construct the temp run
        var run = {
            zone: zone,
            days: days,
            users: users.split(" "),
            items: items.split("\n"),
            points: points
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
        } else {
            res.redirect('/run/create');
        }
    });

    app.post('/run/confirm', app.libs.restrict, function(req, res) {
        // to be implemented
    });
};
