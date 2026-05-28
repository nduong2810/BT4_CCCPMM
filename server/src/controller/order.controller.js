const Order = require('../model/order.model');
const Cart = require('../model/cart.model');

const THIRTY_MINUTES = 30 * 60 * 1000;
const { ORDER_STATUS, ORDER_STATUS_LABELS } = Order;

const STATUS_TRANSITIONS = {
    [ORDER_STATUS.NEW]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLATION_REQUESTED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CANCELLATION_REQUESTED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]: [],
    [ORDER_STATUS.CANCELLED]: []
};

const addStatusHistory = (order, status, note, changedBy = 'system') => {
    order.status = status;
    order.statusHistory.push({
        status,
        label: ORDER_STATUS_LABELS[status],
        note,
        changedBy,
        changedAt: new Date()
    });
};

const canMoveStatus = (currentStatus, nextStatus) => {
    return STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) || false;
};

const autoConfirmOldNewOrders = async () => {
    const expiredAt = new Date(Date.now() - THIRTY_MINUTES);

    const orders = await Order.find({
        status: ORDER_STATUS.NEW,
        createdAt: { $lte: expiredAt }
    });

    await Promise.all(orders.map(async (order) => {
        addStatusHistory(
            order,
            ORDER_STATUS.CONFIRMED,
            'Hệ thống tự động xác nhận sau 30 phút',
            'system'
        );
        order.confirmedAt = new Date();
        await order.save();
    }));
};

const scheduleAutoConfirm = (orderId) => {
    setTimeout(async () => {
        try {
            const order = await Order.findById(orderId);
            if (!order || order.status !== ORDER_STATUS.NEW) return;

            addStatusHistory(
                order,
                ORDER_STATUS.CONFIRMED,
                'Hệ thống tự động xác nhận sau 30 phút',
                'system'
            );
            order.confirmedAt = new Date();
            await order.save();
        } catch (error) {
            console.error('Auto confirm order error:', error.message);
        }
    }, THIRTY_MINUTES);
};

const getCancelInfo = (order) => {
    const createdAt = new Date(order.createdAt).getTime();
    const elapsed = Date.now() - createdAt;
    const remainingMs = Math.max(THIRTY_MINUTES - elapsed, 0);
    const canCancelDirectly = [ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(order.status) && elapsed <= THIRTY_MINUTES;
    const canRequestCancel = order.status === ORDER_STATUS.PREPARING;

    return {
        canCancelDirectly,
        canRequestCancel,
        remainingMs,
        remainingMinutes: Math.ceil(remainingMs / 60000)
    };
};

const buildOrderResponse = (order) => ({
    ...order.toObject(),
    statusLabel: ORDER_STATUS_LABELS[order.status],
    cancelInfo: getCancelInfo(order),
    nextStatuses: STATUS_TRANSITIONS[order.status] || []
});

// Thanh toán COD
exports.checkoutCOD = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        const cart = await Cart.findOne({ user: req.user.userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
        }

        const newOrder = new Order({
            user: req.user.userId,
            items: cart.items,
            shippingAddress,
            paymentMethod: 'COD',
            totalAmount: cart.totalPrice,
            status: ORDER_STATUS.NEW
        });

        await newOrder.save();
        scheduleAutoConfirm(newOrder._id);

        // Reset giỏ hàng
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(201).json({
            success: true,
            message: 'Đặt hàng COD thành công',
            order: buildOrderResponse(newOrder)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lịch sử mua hàng của người dùng
exports.getMyOrders = async (req, res) => {
    try {
        await autoConfirmOldNewOrders();

        const orders = await Order.find({ user: req.user.userId })
            .populate('items.product', 'name images price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders: orders.map(buildOrderResponse)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Chi tiết theo dõi một đơn hàng
exports.getMyOrderDetail = async (req, res) => {
    try {
        await autoConfirmOldNewOrders();

        const order = await Order.findOne({ _id: req.params.id, user: req.user.userId })
            .populate('items.product', 'name images price description');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        res.status(200).json({
            success: true,
            order: buildOrderResponse(order)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Hủy đơn hoặc gửi yêu cầu hủy đơn
exports.cancelMyOrder = async (req, res) => {
    try {
        await autoConfirmOldNewOrders();

        const { reason = '' } = req.body;
        const order = await Order.findOne({ _id: req.params.id, user: req.user.userId });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const cancelInfo = getCancelInfo(order);

        if (cancelInfo.canCancelDirectly) {
            addStatusHistory(order, ORDER_STATUS.CANCELLED, reason || 'Khách hàng hủy đơn trong 30 phút sau khi đặt', 'user');
            order.cancelReason = reason;
            order.cancelledAt = new Date();
            await order.save();

            return res.status(200).json({
                success: true,
                message: 'Đã hủy đơn hàng thành công',
                order: buildOrderResponse(order)
            });
        }

        if (cancelInfo.canRequestCancel) {
            addStatusHistory(order, ORDER_STATUS.CANCELLATION_REQUESTED, reason || 'Khách hàng gửi yêu cầu hủy khi shop đang chuẩn bị hàng', 'user');
            order.cancelReason = reason;
            order.cancelRequestedAt = new Date();
            await order.save();

            return res.status(200).json({
                success: true,
                message: 'Đã gửi yêu cầu hủy đơn cho shop',
                order: buildOrderResponse(order)
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Đơn hàng chỉ được hủy trong 30 phút sau khi đặt. Nếu shop đang chuẩn bị hàng, hệ thống sẽ gửi yêu cầu hủy cho shop.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Shop/admin cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
    try {
        await autoConfirmOldNewOrders();

        const { status, note = '' } = req.body;
        const allowStatuses = [
            ORDER_STATUS.CONFIRMED,
            ORDER_STATUS.PREPARING,
            ORDER_STATUS.SHIPPING,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.CANCELLED
        ];

        if (!allowStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (!canMoveStatus(order.status, status)) {
            return res.status(400).json({
                success: false,
                message: `Không thể chuyển đơn hàng từ "${ORDER_STATUS_LABELS[order.status]}" sang "${ORDER_STATUS_LABELS[status]}"`,
                currentStatus: order.status,
                nextStatuses: STATUS_TRANSITIONS[order.status] || []
            });
        }

        addStatusHistory(order, status, note || `Shop cập nhật trạng thái: ${ORDER_STATUS_LABELS[status]}`, 'shop');

        if (status === ORDER_STATUS.CONFIRMED) order.confirmedAt = new Date();
        if (status === ORDER_STATUS.CANCELLED) order.cancelledAt = new Date();

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công',
            order: buildOrderResponse(order)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
