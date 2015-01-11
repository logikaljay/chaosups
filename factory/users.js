var mongoose = require('mongoose');
var util = require('util');

module.exports = function(app) {
    app.factory.users = {};

    app.factory.users.getById = function(id, fn) {
        var User = mongoose.model('User', app.models.user);
        User.findById(id, function(err, doc) {
            if (err) fn(undefined);
            fn(doc);
        });
    };

    app.factory.users.getByName = function(name, fn) {
        var User = mongoose.model('User', app.models.user);
        User.findOne({ name: name }, function(err, doc) {
            if (err) fn(undefined);
            fn(doc);
        });
    };

    app.factory.users.getAll = function(fn) {
        var User = mongoose.model('User', app.models.user);
        User.find({}, function(err, docs) {
            if (err) fn(undefined);
            fn(docs);
        });
    };

    app.factory.users.exists = function(name, fn) {
        var User = mongoose.model('User', app.models.user);
        User.findOne({ name: name }, function(err, doc) {
            if (err) fn(false);
            if (doc !== undefined) fn(true);

            fn(false);
        });
    };

    app.factory.users.isAdmin = function(user) {
        if (user.type == 2) {
            return true;
        }

        return false;
    };

    app.factory.users.add = function(name, fn) {
        if (name === undefined) {
            return false;
        }

        // create a new user that must change their password
        var User = mongoose.model('User', app.models.user);
        var newUser = new User({
            name: name,
            state: 3,
            points: []
        });

        // temp - generate temp password for the user
        var tmpPassword = util.format('%s123', name);

        // generate a hash for the user
        app.libs.hash(tmpPassword, function(err, salt, hash) {
            if (err) return false;

            newUser.salt = salt;
            newUser.hash = hash.toString();

            // save this user
            app.factory.users._save(newUser, fn);
        });
    };

    app.factory.users.addPoints = function(user, zone, points, fn) {
        app.factory.users.getByName(user.name, function(userEntity) {
            console.log(user);
            var Point = mongoose.model('Point', app.models.point);
            var userPoint = new Point({
                user: userEntity,
                zone: zone,
                state: 0,
                amount: points
            });

            userEntity.points.push(userPoint);
            userPoint.save(function(err) {
                userEntity.save(function(err) {
                    fn(userEntity);
                });
            });
        });
    };

    app.factory.users._save = function(user, fn) {
        if (user === undefined) {
            return false;
        }

        // if we got this far - save our document
        user.save(function(err) {
            if (err) return false;

            if (fn) {
                fn(user);
            } else {
                return true;
            }
        });
    };
};
