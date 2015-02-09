// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var daySchema = new Schema({
        name: String,
        amount: Number,
        zone: { type: Schema.Types.ObjectId, ref: 'Zone' }
    });

    app.models.day = daySchema;
};

