import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeCartItem } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartState = useSelector(state => state.cart) || { items: [], totalPrice: 0, loading: true };
    const { items, totalPrice, loading } = cartState;

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    // SỬA LỖI: Thêm console.log để debug
    const handleQuantityChange = (productId, newQuantity) => {
        console.log(`--- BẮT ĐẦU DEBUG ---`);
        console.log(`Nút được nhấn!`);
        console.log(`ID Sản phẩm: ${productId}`);
        console.log(`Số lượng mới: ${newQuantity}`);

        const item = items.find(i => i.product._id === productId);
        if (!item) {
            console.error("Lỗi: Không tìm thấy sản phẩm trong giỏ hàng.");
            return;
        }
        if (item.quantity === newQuantity) {
            console.warn("Thông tin: Số lượng không thay đổi, không gửi yêu cầu.");
            return;
        }

        console.log("Đang gửi action đến Redux...");
        if (newQuantity > 0) {
            dispatch(updateCartItem({ productId, quantity: newQuantity }));
        } else {
            dispatch(removeCartItem(productId));
        }
        console.log("Đã gửi action xong.");
        console.log(`--- KẾT THÚC DEBUG ---`);
    };

    const handleRemoveItem = (productId) => {
        dispatch(removeCartItem(productId));
    };

    return (
        <>
            <Header />
            <main className="bg-gray-100 min-h-screen pt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Giỏ hàng của bạn</h1>
                    
                    {loading && items.length === 0 ? (
                        <div className="text-center p-8">Đang tải giỏ hàng...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg shadow-md">
                            <p className="text-xl text-gray-500">Giỏ hàng của bạn đang trống.</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    ) : (
                        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16 items-start">
                            <div className="lg:col-span-7 bg-white rounded-lg shadow-md p-6">
                                <ul role="list" className="divide-y divide-gray-200">
                                    {items.map((item) => (
                                        <li key={item.product._id} className="flex py-6">
                                            <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                                <img
                                                    src={item.product.imageUrl || 'https://via.placeholder.com/150'}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-center object-cover"
                                                />
                                            </div>

                                            <div className="ml-4 flex-1 flex flex-col">
                                                <div>
                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                        <h3>
                                                            <a href={`/product/${item.product._id}`}>{item.product.name}</a>
                                                        </h3>
                                                        <p className="ml-4">{item.price.toLocaleString()} VND</p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">{item.product.category || 'Chưa phân loại'}</p>
                                                </div>
                                                <div className="flex-1 flex items-end justify-between text-sm">
                                                    <div className="flex items-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                            className="px-2 py-1 border border-gray-300 rounded-l-md text-gray-700 hover:bg-gray-50"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-4 py-1 border-t border-b border-gray-300 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                            className="px-2 py-1 border border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <div className="flex">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.product._id)}
                                                            className="font-medium text-red-600 hover:text-red-500 flex items-center"
                                                        >
                                                            <FaTrash className="mr-1.5 h-5 w-5" />
                                                            <span>Xóa</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="lg:col-span-5 mt-10 lg:mt-0">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-lg font-medium text-gray-900">Tóm tắt đơn hàng</h2>
                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-600">Tạm tính</p>
                                            <p className="text-sm font-medium text-gray-900">{totalPrice.toLocaleString()} VND</p>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                            <p className="text-base font-medium text-gray-900">Tổng cộng</p>
                                            <p className="text-base font-medium text-gray-900">{totalPrice.toLocaleString()} VND</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate('/checkout')}
                                            className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Tiến hành thanh toán
                                        </button>
                                    </div>
                                    <div className="mt-6 text-sm text-center">
                                        <p>
                                            hoặc{' '}
                                            <button onClick={() => navigate('/')} className="font-medium text-indigo-600 hover:text-indigo-500">
                                                Tiếp tục mua sắm<span aria-hidden="true"> &rarr;</span>
                                            </button>
                                        </p>
                                    </div>
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

export default CartPage;