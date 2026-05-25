import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeCartItem } from '../../store/slices/cartSlice';
import { checkoutAPI } from '../../services/orderService';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // State cho form thông tin giao hàng
    const [form, setForm] = useState({ fullName: '', phone: '', address: '' });

    // Lấy dữ liệu giỏ hàng từ Redux store
    const { items, totalPrice, loading } = useSelector(state => state.cart);

    // Tự động fetch giỏ hàng khi component được tải
    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    // Tự động chuyển về trang chủ nếu giỏ hàng trống
    useEffect(() => {
        if (!loading && items.length === 0) {
            alert("Giỏ hàng của bạn đang trống.");
            navigate('/');
        }
    }, [items, loading, navigate]);

    // --- LOGIC CHO NÚT CỘNG/TRỪ ---
    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity > 0) {
            dispatch(updateCartItem({ productId, quantity: newQuantity }));
        } else {
            // Nếu giảm số lượng về 0, xóa sản phẩm khỏi giỏ hàng
            dispatch(removeCartItem(productId));
        }
    };

    // Xử lý khi người dùng nhấn nút đặt hàng
    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.phone || !form.address) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng.');
            return;
        }
        try {
            await checkoutAPI({ shippingAddress: form });
            alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
            navigate('/'); // Chuyển về trang chủ sau khi đặt hàng thành công
        } catch (error) {
            alert('Lỗi khi đặt hàng: ' + (error.response?.data?.message || 'Vui lòng thử lại.'));
        }
    };

    return (
        <>
            <Header />
            <main className="bg-gray-100 min-h-screen pt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Thanh toán</h1>
                    
                    {loading ? (
                        <div className="text-center">Đang tải thông tin đơn hàng...</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                            {/* Cột trái: Thông tin giao hàng */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin giao hàng</h2>
                                <form id="checkout-form" onSubmit={handleCheckout}>
                                    <div className="space-y-4">
                                        <input required placeholder="Họ và Tên" className="border w-full p-3 rounded-md"
                                            onChange={e => setForm({ ...form, fullName: e.target.value })} />
                                        <input required placeholder="Số điện thoại" className="border w-full p-3 rounded-md"
                                            onChange={e => setForm({ ...form, phone: e.target.value })} />
                                        <input required placeholder="Địa chỉ giao hàng" className="border w-full p-3 rounded-md"
                                            onChange={e => setForm({ ...form, address: e.target.value })} />
                                    </div>
                                </form>
                            </div>

                            {/* Cột phải: Tóm tắt đơn hàng */}
                            <div className="bg-white p-6 rounded-lg shadow-md mt-8 lg:mt-0">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Đơn hàng của bạn</h2>
                                <ul role="list" className="divide-y divide-gray-200">
                                    {items.map((item) => (
                                        <li key={item.product._id} className="flex py-4">
                                            <img src={item.product.imageUrl || 'https://via.placeholder.com/150'} alt={item.product.name} className="w-16 h-16 rounded-md object-cover" />
                                            <div className="ml-4 flex-1 flex flex-col justify-center">
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3>{item.product.name}</h3>
                                                    <p className="ml-4">{(item.price * item.quantity).toLocaleString()} VND</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-sm text-gray-500">Giá: {item.price.toLocaleString()} VND</p>
                                                    {/* === NÚT TĂNG GIẢM SỐ LƯỢNG === */}
                                                    <div className="flex items-center">
                                                        <button type="button" onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)} className="px-2 py-0.5 border rounded-l-md">-</button>
                                                        <span className="px-3 py-0.5 border-t border-b">{item.quantity}</span>
                                                        <button type="button" onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)} className="px-2 py-0.5 border rounded-r-md">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <p>Tổng cộng</p>
                                        <p>{totalPrice.toLocaleString()} VND</p>
                                    </div>
                                    <p className="text-sm text-gray-500">Phí vận chuyển sẽ được tính khi giao hàng.</p>
                                </div>
                                <div className="mt-6">
                                    <button type="submit" form="checkout-form" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700">
                                        XÁC NHẬN ĐẶT HÀNG
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default CheckoutPage;