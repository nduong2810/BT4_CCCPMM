import express from 'express';
import { getProducts, getProductById, seedProducts, getHomeProducts, getProductsLazyLoad, getTopHighlights} from '../controller/product.controller.js';
const router = express.Router();

router.get('/test', (req, res) => {
    res.status(200).json({ message: "Đã kết nối thành công vào product.routes.js!" });
});

// Các route chính
router.post('/seed', seedProducts);
router.get('/home-products', getHomeProducts);
router.get('/', getProducts);
router.get('/lazy-load', getProductsLazyLoad);
router.get('/top-highlights', getTopHighlights);
router.get('/:id', getProductById);

export default router;