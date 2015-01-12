var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var itemSchema = new Schema({
        state: Number,
        name: String,
        zone: String,
        minimumBid: Number,
        currentBid: { type: Schema.Types.ObjectId, ref: 'Bid' }
    });

    app.models.item = itemSchema;
};
