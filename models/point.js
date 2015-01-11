var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var pointSchema = new Schema({
        amount: Number,
        state: Number,
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        zone: { type: Schema.Types.ObjectId, ref: 'Zone' }
    });

    app.models.point = pointSchema;
};

