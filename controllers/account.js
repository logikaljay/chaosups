module.exports = function(app) {

    app.get('/account/login', function(req, res) {
        var data = {
            title: 'Login',
            information: 'Please login before using chaosups',
            user: null
        };

        res.render('account/login', data);
    });

    app.post('/account/login', function(req, res) {
        var user = req.body.email.toLowerCase();

        app.libs.authenticate(user, req.body.password, function(err, user) {
            if (user) {
                app.libs.addSessionUser(req, user, function() {
                    res.redirect('/');
                });
            } else {
                req.session.err = 'Authentication failed, please check your username and password.';
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

        res.render('account/edit', { err: err, msg: msg });
    });

    app.post('/account/edit', app.libs.restrict, function(req, res) {
        var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;
        var confirmPassword = req.body.confirmPassword;
        var user = req.session.user.name;

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
                                    res.render('account/edit', { err: "", msg: "Your password was changed successfully" });
                                });
                            }
                        });
                    });
                }
            }
        });
    });

    app.get('/account/logout', app.libs.restrict, function(req, res) {
        req.session.destroy(function() {
            res.redirect('/');
        });
    });

};
