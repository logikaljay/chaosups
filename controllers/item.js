var util = require('util')
  , async = require('async');

module.exports = function(app) {
    app.get('/item/list', app.libs.restrict, function(req, res) {
        res.send('list of items');
    });
}