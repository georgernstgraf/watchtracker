const mongoose = require('mongoose');

const uhrenSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    uhr: {
        type: String,
        required: true
    },
    dateMeasured: {
        type: Date,
        required: true
    },
    offsetSecs: {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model('Uhren', uhrenSchema);

