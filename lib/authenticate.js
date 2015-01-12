module.exports = function(app) {
    app.libs.authenticate = function(name, pass, fn) {
        console.log('authenticating %s:%s', name, pass);
        app.factory.users.getByName(name, function(userEntity) {
            if (!userEntity) {
                return fn(new Error('cannot find user'));
            }

            app.libs.hash(pass, userEntity.salt, function(err, hash) {
                if (err) {
                    return fn(err, null);
                }

                if (hash.toString() == userEntity.hash) {
                    return fn(null, userEntity);
                }

                fn(new Error('invalid password'), null);
            });
        });
    };

    app.libs.restrict = function(req, res, next) {
        if (req.session.user) {
            res.locals.user = req.session.user;
            console.log('setting user session');
            next();
        } else {
            req.session.msg = 'Access Denied';
            res.redirect('/login');
        }
    };
};
