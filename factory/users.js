var mongoose = require('mongoose');
var util = require('util');

module.exports = function(app) {
    app.factory.users = {};

    app.factory.users.getAll = function(fn) {
        var User = mongoose.model('User', app.models.user);
        User.find({}, function(err, docs) {
            if (err) fn(undefined);
            fn(docs);
        });
    };

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
            if (err) {
                console.log("app.factory.users.exists ERROR: " + err);
                return fn(false);
            }

            if (doc !== null) {
                return fn(true);
            }

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

        // all names need to be lowercase
        name = name.toLowerCase();

        // create a new user that must change their password
        var User = mongoose.model('User', app.models.user);
        var newUser = new User({
            type: 0,
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

    app.factory.users._save = function(user, fn) {
        if (user === undefined) {
            if (fn) {
                fn(false);
            } else {
                return false;
            }
        }

        // if we got this far - save our document
        user.save(function(err) {
            if (err) {
                console.log("app.factory.users._save ERROR: " + err);
            }

            if (fn) {
                fn(user);
            } else {
                return true;
            }
        });
    };
};
