module.exports = function(app) {
    app.libs.authenticate = function(name, pass, fn) {
        if (!module.parent) console.log('authenticating %s:%s', name, pass);
            var user = app.users[name];
            if (!user) return fn(new Error('cannot find user'));
            app.libs.hash(pass, user.salt, function(err, hash) {
        
            if (err) return fn(err);
            if (hash.toString() == user.hash) return fn(null, user);
            fn(new Error('invalid password'));
        });
    }

    app.libs.restrict = function(req, res, next) {
        if (req.session.user) {
            next();
        } else {
            req.session.error = 'Access denied!';
            res.redirect('/login'); 
        }
    }
}