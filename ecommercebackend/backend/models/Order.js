const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    order_number: {
        type: Number,
        unique: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    items: [orderItemSchema],
    created_at: {
        type: Date,
        default: Date.now
    }
});

orderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Order', orderSchema);
