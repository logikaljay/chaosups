// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var async = require('async')
  , util = require('util')
  , querystring = require('querystring');

module.exports = function(app) {
    app.get('/search/items', app.libs.restrict, function(req, res) {
        var rawTerms = req.query.term;
        var terms = querystring.unescape(rawTerms);
        var userId = req.session.user.id;

        // get all items, and points
        app.factory.items.getByState(0, function(items) {

            // filter list of items by search terms
            var filteredItems = items.filter(function(item) {
                return item.name.toString().toLowerCase().indexOf(terms.toLowerCase()) > -1;
            });

            app.factory.points.getAllByUserId(userId, function(points) {
                app.factory.items.getWonByUserId(userId, function(wonItems) {
                    res.render('item/list', { items: filteredItems, points: points, wonItems: wonItems, itemId: null });
                });
            });
        });
    });
};
