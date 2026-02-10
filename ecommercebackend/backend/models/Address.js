const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    full_name: String,
    phone: String,
    address_line1: String,
    address_line2: String,
    city: String,
    state: String,
    postal_code: String,
    country: String,
});

addressSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Address', addressSchema);
