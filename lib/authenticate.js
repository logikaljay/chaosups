module.exports = function(app) {
    app.libs.authenticate = function(name, pass, fn) {
        console.log('authenticating %s:%s', name, pass);
        app.factory.users.getByName(name, function(userEntity) {
            if (!userEntity) {
                return fn(new Error('cannot find user'));
            }

            // check if user is locked
            if (userEntity.state == 2) {
                return fn(new Error('Your account is locked'));
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
};
