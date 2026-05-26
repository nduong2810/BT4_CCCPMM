import apiClient from '../lib/apiClient';

// 1. Lấy dữ liệu giỏ hàng
export const getCartData = () => {
    return apiClient.get('/cart');
};

// 2. Thêm sản phẩm vào giỏ hàng
export const addToCartAPI = (data) => {
    return apiClient.post('/cart/add', data);
};

// 3. Cập nhật số lượng sản phẩm
// Data ở đây là một object chứa { productId, quantity } để gửi qua req.body
export const updateCartItemAPI = (data) => {
    return apiClient.put('/cart/update', data);
};

// 4. Xóa sản phẩm khỏi giỏ hàng
// Truyền productId thẳng lên URL params
export const removeCartItemAPI = (productId) => {
    return apiClient.delete(`/cart/remove/${productId}`);
};