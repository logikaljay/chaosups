var util = require('util')
  , async = require('async');

module.exports = function(app) {
    app.get('/run', app.libs.restrict, function(req, res) {
        res.redirect('/run/list');
    });

    app.get('/run/list', app.libs.restrict, function(req, res) {
        app.factory.runs.getAll(function(runs) {
            var approved = runs.filter(function(run) {
                return run.state == 0;
            });

            var unapproved = runs.filter(function(run) {
                return run.state == 1;
            });

            res.render('run/list', { approved: approved, unapproved: unapproved });
        });
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

    app.get('/run/approve/:id', app.libs.restrictAdmin, function(req, res) {
        var runId = req.params.id;

        _updateRunState(runId, 0, function() {
            res.redirect('back');
        });
    });

    app.get('/run/unapprove/:id', app.libs.restrictAdmin, function(req, res) {
        var runId = req.params.id;

        _updateRunState(runId, 1, function() {
            res.redirect('back');
        });
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
        run.leader = req.session.user.name;

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

    _updateRunState = function(runId, state, fn) {
        // get the run in all its detail
        app.factory.runs.getById(runId, function(run) {
            var itemsDone = false;
            var pointsDone = false;

            // update the run state
            run.state = state;
            run.save(function(err) {
                if (err) {
                    console.log(util.format("/run/approve/%s run update ERROR: %s", runId, err));
                }

                // iterate over items
                async.forEach(run.items, function(item, callback) {
                    // update item state
                    item.state = state;
                    item.save(function(err) {
                        if (err) {
                            console.log(util.format("/run/approve/%s item update ERROR: %s", runId, err));
                        }

                        callback();
                    });
                }, function(err) {
                    // iterate over points
                    async.forEach(run.points, function(point, callback) {
                        // update point state
                        point.state = state;
                        point.save(function(err) {
                            if (err) {
                                console.log(util.format("/run/approve/%s point update ERROR: %s", runId, err));
                            }

                            callback();
                        });
                    }, function(err) {
                        fn();
                    });
                });
            });
        });
    };

    _addUsersAndPoints = function(run, users, fn) {
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
                            }

                            callback();
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
                            }

                            callback();
                        }); 
                    });
                }
            });
        }, function(err) {
            // continue process
            fn(run);
        });
    };

    _addItems = function(run, items, fn) {
        // iterate over all the items, adding them
        async.forEach(items, function(item, callback) {
            app.factory.items.add(item.name, item.value, run.zone, function(itemEntity) {
                if (itemEntity !== null) {
                    run.runItems.push(itemEntity);
                }

                callback();
            });
        }, function(err) {
            fn(run)
        });
    };

    _addRun = function(run, fn) {
        // get the leader
        app.factory.users.getByName(run.leader, function(userEntity) {
            console.log(run.runPoints);
            app.factory.runs.add(userEntity, run.runUsers, run.runPoints, run.runItems, run.zone,
                function(runEntity) {
                    fn(runEntity);
                });
        });
    };
};
