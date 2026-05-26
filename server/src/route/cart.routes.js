import express from 'express';
import * as cartController from '../controller/cart.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js'; // Đây là tên hàm của bạn

const router = express.Router();

// Các route cũ
router.get('/', authenticateToken, cartController.getCart);
router.post('/add', authenticateToken, cartController.addToCart);

// 2 ROUTE MỚI THÊM VÀO (Đã đổi tên authMiddleware thành authenticateToken)
router.put('/update', authenticateToken, cartController.updateCartItem);
router.delete('/remove/:productId', authenticateToken, cartController.removeCartItem);

export default router;