var mongoose = require('mongoose');

module.exports = function(app) {
    app.get('/', app.libs.restrict, function(req, res){
        res.render('index', { res: res });
    });

    app.get('/restricted', app.libs.restrict, function(req, res) {
        res.send('Wahoo! restricted area. click to <a href="/logout">logout</a>');
    });
};
