const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number
    }],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    paymentMethod: { type: String, default: 'COD', required: true }, // Bắt buộc COD
    paymentStatus: { type: String, default: 'Pending' },
    totalAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);