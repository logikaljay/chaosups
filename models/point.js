// ChaosUPS - a universal points system.
// Copyright (C) 2015  Jay Baker

var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var pointSchema = new Schema({
        amount: Number,
        state: Number,
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        zone: String
    });

    app.models.point = pointSchema;
};

