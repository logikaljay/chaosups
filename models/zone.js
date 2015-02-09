// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var zoneSchema = new Schema({
        name: String,
        days: [{ type: Schema.Types.ObjectId, ref: 'Day' }]
    });

    app.models.zone = zoneSchema;
};

