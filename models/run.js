var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var runSchema = new Schema({
        state: Number,
        zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
        leader: { type: Schema.Types.ObjectId, ref: 'User' },
        players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
        date: { type: Date, default: Date.now }
    });
};

