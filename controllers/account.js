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
                req.session.user = user;
                    req.session.success = 'Authenticated as ' + user.name
                        + ' click to <a href="/logout">logout</a>. '
                        + ' You may now accesss <a href="/restricted">restricted</a>';
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
    /*
    app.use(function(res, req, next) {
        res.locals.user = res.session.user || "";
        res.locals.msg = "hello world";
        console.dir(res.locals);
        next();
    });
    */
};
