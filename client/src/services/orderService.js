import apiClient from '../lib/apiClient';

export const checkoutAPI = (data) => apiClient.post('/order/checkout', data);