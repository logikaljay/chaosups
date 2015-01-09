var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var userSchema = new Schema({
        type: Number,
        email: { type: String, index: { unique: true, dropDups: true } },
        salt: String,
        hash: String,
        state: Number,
        points: [{ type: Schema.Types.ObjectId, ref: 'Point' }]
    });

    app.models.user = userSchema;
};
