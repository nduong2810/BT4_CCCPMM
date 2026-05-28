const mongoose = require('mongoose');

const ORDER_STATUS = {
    NEW: 'NEW',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    SHIPPING: 'SHIPPING',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    CANCELLATION_REQUESTED: 'CANCELLATION_REQUESTED'
};

const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.NEW]: 'Đơn hàng mới',
    [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận đơn hàng',
    [ORDER_STATUS.PREPARING]: 'Shop đang chuẩn bị hàng',
    [ORDER_STATUS.SHIPPING]: 'Đang giao hàng',
    [ORDER_STATUS.DELIVERED]: 'Đã giao thành công',
    [ORDER_STATUS.CANCELLED]: 'Hủy đơn hàng',
    [ORDER_STATUS.CANCELLATION_REQUESTED]: 'Đã gửi yêu cầu hủy đơn cho shop'
};

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
    paymentMethod: { type: String, default: 'COD', required: true },
    paymentStatus: { type: String, default: 'Pending' },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.NEW
    },
    statusHistory: [{
        status: { type: String, enum: Object.values(ORDER_STATUS), required: true },
        label: { type: String, required: true },
        note: { type: String, default: '' },
        changedBy: { type: String, enum: ['system', 'user', 'shop'], default: 'system' },
        changedAt: { type: Date, default: Date.now }
    }],
    cancelReason: { type: String, default: '' },
    cancelRequestedAt: { type: Date },
    cancelledAt: { type: Date },
    confirmedAt: { type: Date }
}, { timestamps: true });

orderSchema.pre('save', function() {
    if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
        this.statusHistory = [{
            status: this.status || ORDER_STATUS.NEW,
            label: ORDER_STATUS_LABELS[this.status || ORDER_STATUS.NEW],
            note: 'Khách hàng đặt hàng thành công',
            changedBy: 'system',
            changedAt: new Date()
        }];
    }
});

orderSchema.statics.ORDER_STATUS = ORDER_STATUS;
orderSchema.statics.ORDER_STATUS_LABELS = ORDER_STATUS_LABELS;

module.exports = mongoose.model('Order', orderSchema);
