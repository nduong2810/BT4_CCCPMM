import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { checkoutAPI } from '../../services/orderService';
import { fetchCart } from '../../store/slices/cartSlice';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items, totalPrice } = useSelector(state => state.cart);

    const [form, setForm] = useState({ fullName: '', phone: '', address: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!items || items.length === 0) {
            dispatch(fetchCart());
        }
    }, [dispatch, items?.length]);

    const handleCheckout = async (e) => {
        e.preventDefault();

        // Kiểm tra dữ liệu trước khi gửi
        if (!form.fullName || !form.phone || !form.address) {
            alert("Vui lòng điền đầy đủ thông tin giao hàng!");
            return;
        }

        setIsSubmitting(true);
        try {
            // Đảm bảo cấu trúc gửi lên khớp với model: shippingAddress: { fullName, phone, address }
            await checkoutAPI({
                shippingAddress: {
                    fullName: form.fullName,
                    phone: form.phone,
                    address: form.address
                }
            });

            alert('🎉 Đặt hàng thành công!');
            dispatch(fetchCart()); // Làm mới giỏ hàng
            navigate('/');
        } catch (error) {
            // Hiển thị chi tiết lỗi từ server để biết thiếu trường nào
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng";
            alert('Lỗi thanh toán: ' + errorMsg);
            console.error("Checkout error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow pt-32 pb-section-padding px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full">
                {/* Nút quay lại */}
                <div className="mb-6">
                    <Link to="/cart" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Quay lại Giỏ hàng
                    </Link>
                </div>

                <h1 className="text-3xl font-display-lg text-primary mb-8">Thanh toán an toàn</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Cột trái: Form điền thông tin */}
                    <div className="lg:col-span-7">
                        <form onSubmit={handleCheckout} className="bg-white p-8 rounded-2xl border border-surface-variant shadow-sm">

                            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary">local_shipping</span>
                                Thông tin giao hàng
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">Họ và tên người nhận</label>
                                    <input required type="text" placeholder="VD: Nguyễn Văn A" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" onChange={e => setForm({...form, fullName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">Số điện thoại liên hệ</label>
                                    <input required type="tel" placeholder="VD: 0901234567" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" onChange={e => setForm({...form, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary mb-2">Địa chỉ nhận hàng chi tiết</label>
                                    <textarea required rows="3" placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..." className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" onChange={e => setForm({...form, address: e.target.value})}></textarea>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-primary mt-10 mb-6 flex items-center gap-2 border-t border-surface-variant pt-8">
                                <span className="material-symbols-outlined text-secondary">payments</span>
                                Phương thức thanh toán
                            </h2>

                            {/* Card Phương thức thanh toán COD */}
                            <div className="p-5 border-2 border-primary bg-primary/5 rounded-xl flex items-start gap-4 cursor-pointer hover:bg-primary/10 transition-colors">
                                <input type="radio" checked readOnly className="mt-1 w-5 h-5 accent-primary cursor-pointer" />
                                <div>
                                    <p className="font-bold text-primary text-lg flex items-center gap-2">
                                        Thanh toán khi nhận hàng (COD)
                                        <span className="bg-secondary text-white text-[10px] uppercase px-2 py-1 rounded-md tracking-wider">Bắt buộc</span>
                                    </p>
                                    <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                                        Khách hàng sẽ kiểm tra sản phẩm và thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-10 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-container transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                                {!isSubmitting && <span className="material-symbols-outlined">check_circle</span>}
                            </button>
                        </form>
                    </div>

                    {/* Cột phải: Hóa đơn đơn hàng mini */}
                    <div className="lg:col-span-5 sticky top-32">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-variant shadow-sm">
                            <h2 className="text-lg font-bold text-primary mb-6 pb-4 border-b border-surface-variant">
                                Đơn hàng của bạn ({items?.length || 0} sản phẩm)
                            </h2>

                            {/* Danh sách cuộn mini */}
                            <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2">
                                {items?.map(item => (
                                    <div key={item.product._id} className="flex gap-4 items-center">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-16 h-16 border border-surface-variant rounded-lg overflow-hidden bg-white p-1">
                                                <img src={item.product.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                                            </div>
                                            <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{item.quantity}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm line-clamp-2 text-primary">{item.product.name}</p>
                                            <p className="text-sm text-secondary font-medium mt-1">{item.price?.toLocaleString()} VNĐ</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-surface-variant pt-6 space-y-3 text-sm text-on-surface-variant font-medium">
                                <div className="flex justify-between">
                                    <span>Tạm tính</span>
                                    <span>{totalPrice?.toLocaleString()} VNĐ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí giao hàng</span>
                                    <span className="text-secondary">Miễn phí</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6 border-t border-surface-variant pt-6">
                                <span className="font-bold text-lg text-primary">Tổng cộng</span>
                                <span className="font-bold text-3xl text-primary">{totalPrice?.toLocaleString()} VNĐ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CheckoutPage;