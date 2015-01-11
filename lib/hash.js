var crypto = require('crypto');

module.exports = function(app) {
    var len = 128;
    var iterations = 12000;

    app.libs.hash = function(pwd, salt, fn) {
        if (3 == arguments.length) {
            crypto.pbkdf2(pwd, salt, iterations, len, fn);
        } else {
            fn = salt;
            crypto.randomBytes(len, function(err, salt) {
                if (err) return fn(err);

                salt = salt.toString('base64');
                crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash) {
                    if (err) return fn(err);
                    fn(null, salt, hash);
                });
            });
        }
    };

    app.libs.hash('foobar', function(err, salt, hash) {
        if (err) throw err;

        app.users.jay.salt = salt;
        app.users.jay.hash = hash.toString();
    });
};
