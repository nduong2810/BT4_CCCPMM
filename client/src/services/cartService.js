import apiClient from '../lib/apiClient';

export const getCartData = () => apiClient.get('/cart');

export const addToCartAPI = (data) => apiClient.post('/cart/add', data);

// THÊM MỚI: Hàm gọi API để cập nhật số lượng sản phẩm trong giỏ hàng
// data sẽ có dạng { quantity: newQuantity }
export const updateCartItemAPI = (productId, quantity) => {
    return apiClient.put(`/cart/item/${productId}`, { quantity });
};

// THÊM MỚI: Hàm gọi API để xóa một sản phẩm khỏi giỏ hàng
export const removeCartItemAPI = (productId) => {
    return apiClient.delete(`/cart/item/${productId}`);
};