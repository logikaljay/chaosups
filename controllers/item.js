// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var util = require('util')
  , async = require('async');

module.exports = function(app) {
    app.get('/items/list', app.libs.restrict, function(req, res) {
        var userId = req.session.user.id;

        // get items, and points
        app.factory.items.getByState(0, function(items) {
            app.factory.points.getAllByUserId(userId, function(points) {
                app.factory.items.getWonByUserId(userId, function(wonItems) {
                    res.render('item/list', {
                        items: items,
                        points: points,
                        wonItems: wonItems,
                        itemId: null });
                });
            });
        });
    });

    app.get('/items/list/:itemId', app.libs.restrict, function(req, res) {
        var userId = req.session.user.id;
        var itemId = req.params.itemId;

        // get items, and points
        app.factory.items.getByState(0, function(items) {
            app.factory.points.getAllByUserId(userId, function(points) {
                app.factory.items.getWonByUserId(userId, function(wonItems) {
                    res.render('item/list', {
                        items: items,
                        points: points,
                        wonItems: wonItems,
                        itemId: itemId });
                });
            });
        });
    });

    app.get('/items/unsent', app.libs.restrictAdmin, function(req, res) {
        app.factory.items.getByState(2, function(items) {
            res.render('item/unsent', { items: items });
        });
    });

    app.get('/items/sent', app.libs.restrictAdmin, function(req, res) {
        app.factory.items.getByState(3, function(items) {
            res.render('item/sent', { items: items });
        });
    });

    app.get('/items/send/:id', app.libs.restrictAdmin, function(req, res) {
        var itemId = req.params.id;

        // set the item state to 3
        app.factory.items.getById(itemId, function(item) {
            item.state = 3;
            item.save(function(err) {
                res.redirect('back');
            });
        });
    });

    app.get('/items/unsend/:id', app.libs.restrictAdmin, function(req, res) {
        var itemId = req.params.id;

        // set the item state to 2
        app.factory.items.getById(itemId, function(item) {
            item.state = 2;
            item.save(function(err) {
                res.redirect('back');
            });
        });
    });
}
