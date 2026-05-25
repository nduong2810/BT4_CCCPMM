import express from 'express'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import adminRoutes from './admin.routes.js'
import productRoutes from './product.routes.js'

// THAY ĐỔI Ở ĐÂY: Chuyển require thành import và thêm đuôi .js
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/admin', adminRoutes)
router.use('/products', productRoutes)

// THÊM ROUTE CART VÀ ORDER VÀO ĐÂY
router.use('/cart', cartRoutes);
router.use('/order', orderRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server đang hoạt động',
    timestamp: new Date().toISOString(),
  })
})

export default router;