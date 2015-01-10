module.exports = function(app) {
    app.get('/run', app.libs.restrict, function(req, res) {
        res.redirect('/run/list');
    });

    app.get('/run/list', app.libs.restrict, function(req, res) {
        // to be implmented
    });

    app.get('/run/create', app.libs.restrict, function(req, res) {
        var zones = [];
        var users = [];

        res.render('run/create', { zones: zones, users: users });
    });

    app.post('/run/create', app.libs.restrict, function(req, res) {
        // to be implemented
    });
};
