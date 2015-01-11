var util = require('util');
var async = require('async');

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
        tmpDays.forEach(function(day) {
            day = day.toString().split("|");
            days.push({ name: day[0], amount: day[1] });
            points += Number(day[1]);
        });

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
        run = req.session.run;
        run.users = req.body.user;
        run.items = req.body.item;

        run.runUsers = [];
        run.runItems = [];
        run.runPoints = [];

        _addUsersAndPoints(run, run.users, function(run) {
            _addItems(run, run.items, function(run) {
                _addRun(run, function(entity) {
                    res.redirect('/');
                });
            })
        });
    });

    _addUsersAndPoints: function(run, users, fn) {
        // iterate over each user and if they don't exist - create them
        async.forEach(users, function(user, callback) {
            app.factory.users.exists(user.name, function(exists) {
                if (exists) {
                    // get the user
                    app.factory.users.getByName(user.name, function(userEntity) {
                        // add the user to the run
                        if (userEntity !== null) {
                            run.runUsers.push(userEntity);
                        }

                        // add points to the user
                        app.factory.points.add(userEntity, run.zone, user.points, function(pointEntity) {
                            console.log('added ' + pointEntity.amount + ' points to ' + userEntity.name);
                            if (pointEntity !== null) {
                                run.runPoints.push(pointEntity);
                                callback();
                            }
                        });

                    });
                } else {
                    app.factory.users.add(user.name, function(userEntity) {
                        // add the user to the run
                        if (userEntity !== null) {
                            run.runUsers.push(userEntity);
                        }

                        // add points to the user
                        app.factory.points.add(userEntity, run.zone, user.points, function(pointEntity) {
                            console.log('added ' + pointEntity.amount + ' points  to ' + userEntity.name);
                            if (pointEntity !== null) {
                                run.runPoints.push(pointEntity);
                                callback();
                            }
                        }); 
                    });
                }
            });
        }, function(err) {
            // continue process
            fn(run);
        });
    };

    _addItems: function(run, items, fn) {
        // iterate over all the items, adding them
        async.forEach(items, function(item, callback) {
            app.factory.items.add(item.name, item.value, run.zone, function(itemEntity) {
                if (itemEntity !== null) {
                    run.runItems.push(itemEntity);
                }
            });
        }, function(err) {
            fn(run)
        });
    };

    _addRun: function(run, fn) {
        // get the leader
        app.factory.users.getByName(req.session.user.name, function(userEntity) {
            console.log(run.runPoints);
            app.factory.runs.add(userEntity, run.runUsers, run.runPoints, run.runItems, run.zone,
                function(runEntity) {
                    fn(runEntity);
                });
        });
    };
};
