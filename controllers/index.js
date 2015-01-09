var mongoose = require('mongoose');

module.exports = function(app) {

    app.get('/', app.libs.restrict, function(req, res){
        res.render('index', { res: res })
    });
    
    app.get('/login', function(req, res) {
        var data = {
            title: 'Login',
            information: 'Please login before using chaosups', 
        }

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
                    res.redirect('/restricted');
                });
            } else {
                req.session.error = 'Authentication failed, please check your '
                        + ' username and password.';
                res.redirect('/login');
            }
        });
    });

    app.get('/restricted', app.libs.restrict, function(req, res) {
        res.send('Wahoo! restricted area. click to <a href="/logout">logout</a>');
    });

    app.get('/logout', function(req, res) {
        req.session.destroy(function() {
            res.redirect('/');
        });
    });
}
