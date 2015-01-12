var mongoose = require('mongoose');

module.exports = function(app) {
    app.get('/', app.libs.restrict, function(req, res){
        var userId = req.session.user.id;
        
        // load user points and inject into the session
        app.factory.points.getAllByUserId(userId, function(points) {
            // set the points to the session
            res.locals.points = points;
            req.session.points = points;
            console.log("POINTS: " + points);

            // get runs
            app.factory.runs.getAll(function(runs) {
                res.render('index', { runs: runs });
            });
        });
    });

    app.get('/restricted', app.libs.restrict, function(req, res) {
        res.send('Wahoo! restricted area. click to <a href="/logout">logout</a>');
    });
};
