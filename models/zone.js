var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var zoneSchema = new Schema({
        name: String,
        amount: Number
    });

    app.models.zone = zoneSchema;
};

