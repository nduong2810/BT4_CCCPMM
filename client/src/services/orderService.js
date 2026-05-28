import apiClient from '../lib/apiClient';

export const checkoutAPI = (data) => apiClient.post('/order/checkout', data);
export const getMyOrdersAPI = () => apiClient.get('/order/my-orders');
export const getMyOrderDetailAPI = (id) => apiClient.get(`/order/my-orders/${id}`);
export const cancelMyOrderAPI = (id, reason) => apiClient.patch(`/order/my-orders/${id}/cancel`, { reason });
