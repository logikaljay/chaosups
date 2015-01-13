var async = require('async')
  , util = require('util');

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
                return user.type == 0 && user.state !== 2;
            })

            var disabled = users.filter(function(user) {
                return user.state == 2;
            });

            res.render('users/list', { admins: admins, gatekeepers: gatekeepers, normal: normal, disabled: disabled });
        });
    });

    app.get('/users/detail/:id', app.libs.restrict, function(req, res) {

    });

    app.get('/users/lock/:id', app.libs.restrictAdmin, function(req, res) {
        var userId = req.params.id;
        app.factory.users.getById(userId, function(user) {
            user.state = 2;

            app.factory.users._save(user, function() {
                res.redirect('/users/list');
            })
        });
    });

    app.get('/users/unlock/:id', app.libs.restrictAdmin, function(req, res) {
        var userId = req.params.id;
        app.factory.users.getById(userId, function(user) {
            user.state = 1;

            app.factory.users._save(user, function() {
                res.redirect('/users/list');
            })
        });
    });
}