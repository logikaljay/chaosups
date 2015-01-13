module.exports = function(app) {
    app.libs.addSessionUser = function(req, user, fn) {
        req.session.regenerate(function() {
            var sessionUser = {
                name: user.name,
                points: user.points,
                id: user._id,
                state: user.state,
                isAdmin: user.type == 2 ? true : false
            };
            req.session.user = sessionUser;

            fn();
        });
    }
}