import express from 'express';
import * as orderController from '../controller/order.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/checkout', authenticateToken, orderController.checkoutCOD);

export default router;