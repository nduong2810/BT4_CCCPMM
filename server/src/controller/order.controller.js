const Order = require('../model/order.model');
const Cart = require('../model/cart.model');

// Thanh toán COD
exports.checkoutCOD = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        const cart = await Cart.findOne({ user: req.user.userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
        }

        const newOrder = new Order({
            user: req.user.userId,
            items: cart.items,
            shippingAddress,
            paymentMethod: 'COD', // Cứng phương thức COD
            totalAmount: cart.totalPrice
        });

        await newOrder.save();

        // Reset giỏ hàng
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(201).json({ success: true, message: "Đặt hàng COD thành công", order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};