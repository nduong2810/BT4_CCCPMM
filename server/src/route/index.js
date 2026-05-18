import express from 'express'
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import adminRoutes from './admin.routes.js'

// THAY ĐỔI Ở ĐÂY: Dùng import thay vì require
import productRoutes from './product.routes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/admin', adminRoutes)

// THÊM ROUTE PRODUCT
router.use('/products', productRoutes)

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server đang hoạt động',
    timestamp: new Date().toISOString(),
  })
})

export default router;