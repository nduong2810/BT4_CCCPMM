import express from 'express';
import * as orderController from '../controller/order.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/checkout', authenticateToken, orderController.checkoutCOD);
router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.get('/my-orders/:id', authenticateToken, orderController.getMyOrderDetail);
router.patch('/my-orders/:id/cancel', authenticateToken, orderController.cancelMyOrder);
router.patch('/:id/status', authenticateToken, authorizeRole('admin'), orderController.updateOrderStatus);

export default router;
