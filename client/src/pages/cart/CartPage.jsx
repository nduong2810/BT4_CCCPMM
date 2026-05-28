import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeCartItem } from '../../store/slices/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getProductImageUrl } from '../../utils/imageUrl';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalPrice, loading } = useSelector(state => state.cart);

    useEffect(() => {
        dispatch(fetchCart());
        window.scrollTo(0, 0); // Tự động cuộn lên đầu trang
    }, [dispatch]);

    const handleQuantityChange = async (productId, quantity) => {
        if (quantity > 0) {
            try {
                // Thêm unwrap() để bắt lỗi từ Redux Thunk
                await dispatch(updateCartItem({ productId, quantity })).unwrap();
            } catch (error) {
                alert("❌ Lỗi cập nhật số lượng: " + (error.message || error));
                console.error(error);
            }
        }
    };

    const handleRemoveItem = async (productId) => {
        if (window.confirm('Bạn có chắc chắn muốn bỏ sản phẩm này khỏi giỏ hàng?')) {
            try {
                await dispatch(removeCartItem(productId)).unwrap();
            } catch (error) {
                alert("❌ Lỗi xóa sản phẩm: " + (error.message || error));
                console.error(error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <p className="text-xl font-medium text-primary">Đang tải giỏ hàng...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface text-on-surface flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full">
                <h1 className="text-3xl font-display-lg text-primary mb-8">Giỏ hàng của bạn</h1>

                {(!items || items.length === 0) ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-surface-variant shadow-sm flex flex-col items-center">
                        <span className="material-symbols-outlined text-[80px] text-surface-variant mb-4">shopping_cart_off</span>
                        <p className="text-xl text-on-surface-variant mb-6 font-medium">Giỏ hàng của bạn đang trống.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary hover:bg-primary-container text-white font-bold py-3 px-8 rounded-xl transition-colors duration-300"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cột trái: Danh sách sản phẩm */}
                        <div className="lg:col-span-8 space-y-6">
                            {items.map((item) => (
                                <div key={item.product._id} className="flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-2xl border border-surface-variant shadow-sm items-center relative transition-transform hover:-translate-y-1">
                                    <Link to={`/product/${item.product._id}`} className="w-32 h-32 sm:w-28 sm:h-28 flex-shrink-0 border border-outline-variant rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center">
                                        <img
                                            src={getProductImageUrl(item.product)}
                                            alt={item.product.name || 'Sản phẩm'}
                                            className="block max-w-full max-h-full w-full h-full object-contain object-center"
                                            loading="lazy"
                                            onError={(event) => {
                                                event.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                            }}
                                        />
                                    </Link>

                                    <div className="flex-1 w-full text-center sm:text-left">
                                        <Link to={`/product/${item.product._id}`} className="text-lg font-bold text-primary hover:text-secondary transition-colors line-clamp-2">
                                            {item.product.name}
                                        </Link>
                                        <p className="mt-2 text-primary font-headline-md">{item.price?.toLocaleString()} VNĐ</p>
                                    </div>

                                    {/* Khu vực nút bấm: Ngang hàng trên Desktop */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
                                        {/* Nút cộng trừ */}
                                        <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-surface-container-lowest">
                                            <button onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)} className="px-3 py-2 text-on-surface-variant hover:bg-surface-variant transition-colors">-</button>
                                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                                            <button onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)} className="px-3 py-2 text-on-surface-variant hover:bg-surface-variant transition-colors">+</button>
                                        </div>

                                        {/* Nút xóa ngang hàng */}
                                        <button
                                            onClick={() => handleRemoveItem(item.product._id)}
                                            className="text-error hover:bg-error-container p-2 rounded-full transition-colors flex items-center justify-center"
                                            title="Xóa khỏi giỏ hàng"
                                        >
                                            <span className="material-symbols-outlined text-[24px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cột phải: Tóm tắt thanh toán */}
                        <div className="lg:col-span-4 sticky top-32">
                            <div className="bg-white rounded-2xl border border-surface-variant shadow-sm p-6">
                                <h2 className="text-xl font-bold text-primary mb-6 pb-4 border-b border-surface-variant">Tóm tắt đơn hàng</h2>

                                <div className="space-y-4 mb-6 text-on-surface-variant">
                                    <div className="flex items-center justify-between">
                                        <p>Tạm tính ({items.length} sản phẩm)</p>
                                        <p className="font-medium text-primary">{totalPrice?.toLocaleString()} VNĐ</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p>Phí giao hàng</p>
                                        <p className="font-medium text-secondary">Miễn phí</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-surface-variant pt-6 mb-8">
                                    <p className="text-lg font-bold text-primary">Tổng thanh toán</p>
                                    <p className="text-2xl font-bold text-primary">{totalPrice?.toLocaleString()} VNĐ</p>
                                </div>

                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-primary hover:bg-primary-container text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                                >
                                    Tiến hành thanh toán <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </button>

                                <div className="mt-4 text-center">
                                    <Link to="/" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                                        Tiếp tục mua sắm
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CartPage;
