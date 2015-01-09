var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var pointSchema = new Schema({
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
        amount: Number
    });

    app.models.point = pointSchema;
};

