// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var async = require('async')
  , mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var runSchema = new Schema({
        state: Number,
        zone: String,
        days: String,
        leader: { type: Schema.Types.ObjectId, ref: 'User' },
        points: [{ type: Schema.Types.ObjectId, ref: 'Point' }],
        items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
        date: { type: Date, default: Date.now }
    });

    runSchema.pre('remove', function(next) {
        // cascade delete to points and items

        var points = this.points;
        var items = this.items;

        async.forEach(points, function(point, callback) {
            point.remove(function(err) {
                callback();
            });;
            
        }, function(err) {

            async.forEach(items, function(item, callback) {
                item.remove(function(err) {
                    callback();
                });
            }, function(err) {
                next();
            });

        });
    });

    app.models.run = runSchema;
};
