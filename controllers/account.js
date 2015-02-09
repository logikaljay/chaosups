// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

module.exports = function(app) {

    app.get('/account/login', function(req, res) {
        var msg = "";
        var err = "";
        if (req.session.err) {
            err = req.session.err;
            delete req.session.err;
        }

        if (req.session.msg) {
            msg = req.session.msg;
            delete req.session.msg;
        }

        var data = {
            title: 'Login',
            user: null,
            err: err,
            msg: msg
        };

        res.render('account/login', data);
    });

    app.post('/account/login', function(req, res) {
        var user = req.body.email.toLowerCase();
        var rememberMe = req.body.rememberMe;
        var destinationUrl = req.session.destinationUrl;
        delete req.session.destinationUrl;

        app.libs.authenticate(user, req.body.password, function(err, user) {
            if (user) {
                app.libs.addSessionUser(req, user, function(sessionUser) {
                    // check if we are sending the session user as a cookie
                    if (rememberMe) {
                        res.cookie('user', sessionUser);
                    }

                    // check if we have a destination url
                    if (destinationUrl) {
                        res.redirect(destinationUrl);
                    } else {
                        res.redirect('/');
                    }
                });
            } else {
                req.session.err = 'Authentication failed, ' +
                    'please check your username and password.';

                res.redirect('/account/login');
            }
        });
    });

    app.get('/account/edit', app.libs.restrict, function(req, res) {
        var msg = "";
        var err = "";

        if (req.session.msg) {
            msg = req.session.msg;
        }

        if (req.session.err) {
            err = req.session.err;
        };

        var alts = [];
        var user = req.session.user;

        if (user.alts !== undefined) {
            alts = user.alts;
        }

        res.render('account/edit', { err: err, msg: msg, alts: alts });
    });

    app.post('/account/edit', app.libs.restrict, function(req, res) {
        var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;
        var confirmPassword = req.body.confirmPassword;
        var user = req.session.user.name;
        var alts = req.body.alts;

        if (oldPassword.length > 0) {
            resetPassword(req, res, user, oldPassword, newPassword, confirmPassword);
        } else if (alts !== undefined && alts.length > 0) {
            app.factory.users.addAltsToUserId(req.session.user.id, alts, function(user) {
                app.libs.addSessionUser(req, user, function() {
                    res.redirect("/account/edit");
                });
            });
        } else if (alts == undefined && oldPassword.length == 0) {
            // remove all alts from user
            app.factory.users.addAltsToUserId(req.session.user.id, [], function(user) {
                app.libs.addSessionUser(req, user, function() {
                    res.render('account/edit', { err: "", msg: "", alts: [] });
                });
            });
        }
    });

    app.get('/account/logout', app.libs.restrict, function(req, res) {
        req.session.destroy(function() {
            res.redirect('/');
        });
    });

    function resetPassword(req, res, user, oldPassword, newPassword, confirmPassword) {
        // check oldPassword
        app.libs.authenticate(user, oldPassword, function(err, user) {
            if (!user) {
                res.render('account/edit', { err: "Your old password was incorrect", msg: "" });
            } else {
                // check newPassword == confirmPassword
                if (newPassword !== confirmPassword) {
                    res.render('account/edit', { err: "Your passwords do not match", msg: "" });
                } else {
                    // generate a hash for the user
                    app.libs.hash(newPassword, function(err, salt, hash) {
                        if (err) return false;

                        // set the new password salt and hash
                        user.salt = salt;
                        user.hash = hash.toString();

                        // undo force password change
                        if (user.state == 3) {
                            user.state = 1;
                        }

                        // save this user
                        app.factory.users._save(user, function(user) {
                            if (user == false) {
                                res.render('account/edit', { err: "Something went wrong while trying to update your password.", msg: "" });
                            } else {
                                app.libs.addSessionUser(req, user, function() {
                                    res.redirect("/");
                                });
                            }
                        });
                    });
                }
            }
        });
    }

};
