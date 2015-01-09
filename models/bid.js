var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var bidSchema = new Schema({
        item: { type: Schema.Types.ObjectId, ref: 'Item' },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        previous: { type: Schema.Types.ObjectId, ref: 'Bid' }
    });

    app.models.bid = bidSchema;
};
