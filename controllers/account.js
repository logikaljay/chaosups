module.exports = function(app) {

    app.get('/login', function(req, res) {
        var data = {
            title: 'Login',
            information: 'Please login before using chaosups',
        };

        res.render('login', data);
    });

    app.post('/login', function(req, res) {
        app.libs.authenticate(req.body.email, req.body.password, function(err, user) {
            if (user) {
                req.session.regenerate(function() {
                    if (user.type == 2) {
                        user.isAdmin = true;
                    } else {
                        user.isAdmin = false;
                    }
                    
                    req.session.user = user;
                    res.redirect('/run/create');
                });
            } else {
                req.session.error = 'Authentication failed, please check your username and password.';
                res.redirect('/login');
            }
        });
    });

    app.get('/logout', app.libs.restrict, function(req, res) {
        req.session.destroy(function() {
            res.redirect('/');
        });
    });
};
