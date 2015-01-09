var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var itemSchema = new Schema({
        state: Number,
        name: String,
        zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
        run: { type: Schema.Types.ObjectId, ref: 'Run' },
        currentBid: { type: Schema.Types.ObjectId, ref: 'Bid' }
    });

    app.models.item = itemSchema;
};

