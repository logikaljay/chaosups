var mongoose = require('mongoose');

module.exports = function(app) {
    app.get('/', app.libs.restrict, function(req, res){
        // get runs
        app.factory.runs.getAll(function(runs) {
            res.render('index', { runs: runs });
        });
    });

    app.get('/restricted', app.libs.restrict, function(req, res) {
        res.send('Wahoo! restricted area. click to <a href="/logout">logout</a>');
    });
};
