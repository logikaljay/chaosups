var util = require('util')
  , async = require('async');

module.exports = function(app) {
    app.get('/item/list', app.libs.restrict, function(req, res) {
        var userId = req.session.user.id;
        
        // get items, and points
        app.factory.items.getByState(0, function(items) {
            app.factory.points.getAllByUserId(userId, function(points) {
                res.render('item/list', { items: items, points: points });
            });
        });
    });
}