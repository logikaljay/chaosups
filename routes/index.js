
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { res: res })
};

exports.login = function(req, res) {
    var data = {
        title: 'Login',
        information: 'Please login before using chaosups'
    }

    res.render('login', data);
}

exports.login_post = function(app) {
    return function(req, res) {
        app.authenticate(req.body.email, req.body.password, function(err, user) {
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
                res.redirect('login');
            }
        });
    }
}
