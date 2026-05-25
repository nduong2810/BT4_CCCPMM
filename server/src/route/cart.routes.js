import express from 'express';
import * as cartController from '../controller/cart.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js'; // Đổi protect thành authenticateToken

const router = express.Router();

router.get('/', authenticateToken, cartController.getCart);
router.post('/add', authenticateToken, cartController.addToCart);

export default router;