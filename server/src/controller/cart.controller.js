import Cart from '../model/cart.model.js';

// Lấy giỏ hàng
export const getCart = async (req, res) => {
    try {
        // ĐÃ SỬA: Lấy đúng biến userId từ middleware của bạn
        const userId = req.user.userId;

        let cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
        }
        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Thêm vào giỏ hàng
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity, price } = req.body;

        // ĐÃ SỬA: Lấy đúng biến userId từ middleware của bạn
        const userId = req.user.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Lỗi xác thực người dùng!" });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity, price });
        }

        cart.totalPrice = cart.items.reduce((total, item) => total + (item.quantity * item.price), 0);
        await cart.save();

        res.status(200).json({ success: true, message: 'Đã thêm vào giỏ hàng', cart });
    } catch (error) {
        console.error("❌ LỖI TẠI addToCart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};