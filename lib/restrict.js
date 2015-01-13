module.exports = function(app) {
    app.libs.restrict = function(req, res, next) {
        if (req.session.points) {
            res.locals.points = req.session.points;
        }

        if (req.session.user) {
            res.locals.url = req.url;
            res.locals.user = req.session.user;

            // check if user must change their password
            if (req.session.user.state == 3 && 
                (req.url.toLowerCase() !== '/account/edit'
                    && req.url.toLowerCase() !== '/account/logout')) {
                req.session.msg = "You must change your password."
                res.redirect('/account/edit');
            } else {
                next();
            }
        } else {
            req.session.msg = 'Access Denied';
            res.redirect('/account/login');
        }
    };

    app.libs.restrictAdmin = function(req, res, next) {
        if (req.session.user) {
            res.locals.user = req.session.user;
            if (req.session.user.isAdmin) {
                // check if user must change their password
                if (req.session.user.state == 3 && 
                    (req.url.toLowerCase() !== '/account/edit'
                        && req.url.toLowerCase() !== '/account/logout')) {
                    req.session.msg = "You must change your password."
                    res.redirect('/account/edit');
                } else {
                    // user is logged in, and an admin
                    next();
                }
            } else {
                // user is logged in, but not an admin
                req.session.msg = 'Access denied';
                res.redirect('back');
            }
        } else {
            req.session.msg = 'Access denied';
            res.redirect('/login');
        }
    }
}