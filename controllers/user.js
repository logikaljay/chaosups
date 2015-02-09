// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var async = require('async'),
    util = require('util');

module.exports = function(app) {
    app.get('/users/list', app.libs.restrict, function(req, res) {
        app.factory.users.getAll(function(users) {
            var admins = users.filter(function(user) {
                return user.type == 2;
            });

            var gatekeepers = users.filter(function(user) {
                return user.type == 1;
            });

            var normal = users.filter(function(user) {
                return user.type === 0 && user.state !== 2;
            });

            var disabled = users.filter(function(user) {
                return user.state == 2;
            });

            res.render('users/list', { admins: admins, gatekeepers: gatekeepers, normal: normal, disabled: disabled });
        });
    });

    app.get('/users/detail/:id', app.libs.restrict, function(req, res) {
        var userId = req.params.id;

        app.factory.users.getById(userId, function(user) {
            app.factory.points.getAllByUserId(userId, function(points) {
                app.factory.bids.getAllByUserId(userId, function(bids) {
                    res.render('users/detail', { entity: user, points: points, bids: bids });
                });
            });
        });
    });

    app.get('/users/lock/:id', app.libs.restrictAdmin, function(req, res) {
        var userId = req.params.id;
        app.factory.users.getById(userId, function(user) {
            user.state = 2;

            app.factory.users._save(user, function() {
                res.redirect('/users/list');
            });
        });
    });

    app.get('/users/unlock/:id', app.libs.restrictAdmin, function(req, res) {
        var userId = req.params.id;
        app.factory.users.getById(userId, function(user) {
            user.state = 1;

            app.factory.users._save(user, function() {
                res.redirect('/users/list');
            });
        });
    });

    app.post('/users/reset/:id', app.libs.restrictAdmin, function(req, res) {
        var userId = req.params.id;
        var userMustChange = req.body.mustChange;
        var newPassword = req.body.newPassword;

        app.factory.users.getById(userId, function(user) {
            // generate a hash for the user
            app.libs.hash(newPassword, function(err, salt, hash) {
                if (err) return false;

                // set the new password salt and hash
                user.salt = salt;
                user.hash = hash.toString();

                if (userMustChange) {
                    user.state = 3;
                }

                user.save(function(err) {
                    res.redirect('back');
                });
            });
        });
    });

    app.get('/users/delete/:id', app.libs.restrictAdmin, function(req, res) {
        var userId = req.params.id;

        app.factory.users.getById(userId, function(user) {
            if (user) {
                user.remove(function() {
                    res.redirect('/users/list');
                });
            } else {
                res.redirect('/users/list');
            }
        });
    });
};
