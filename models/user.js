var mongoose = require('mongoose');

module.exports = function(app) {
    var Schema = mongoose.Schema;
    var userSchema = new Schema({
        type: Number,
        name: { type: String, index: { unique: true, dropDups: true } },
        salt: String,
        hash: String,
        state: Number,
        points: [{ type: Schema.Types.ObjectId, ref: 'Point' }],
        alts: [ String ]
    }, { strict: false });

    app.models.user = userSchema;
};
