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
                req.session.regenerate(function() {
                    var sessionUser = {
                        name: user.name,
                        points: user.points,
                        id: user._id,
                        isAdmin: user.type == 2 ? true : false
                    };
                    req.session.user = sessionUser;
                    res.redirect('/');
                });
            } else {
                req.session.error = 'Authentication failed, please check your username and password.';
                res.redirect('/account/login');
            }
        });
    });

    app.get('/account/edit', app.libs.restrict, function(req, res) {
        res.render('account/edit');
    });

    app.get('/account/logout', app.libs.restrict, function(req, res) {
        req.session.destroy(function() {
            res.redirect('/');
        });
    });

};
