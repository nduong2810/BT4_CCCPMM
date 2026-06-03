import { Navigate, Route, Routes, Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyResetOTP from './components/auth/VerifyResetOTP';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import ProfilePage from './pages/profile/ProfilePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderHistoryPage from './pages/order/OrderHistoryPage';

// Import trang bán hàng
import HomePage from './pages/home/HomePage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import './App.css';

function RequireAuth({ children }) {
    const { isAuthenticated } = useSelector((state) => state.login);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}

// Khung nền chỉ dùng cho các trang Đăng nhập / Profile
function Shell() {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_45%,_#eef2ff_100%)] px-4 py-8 text-slate-900 sm:py-12">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-2xl shadow-slate-200/80 backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
                    <aside className="hidden bg-gradient-to-br from-primary via-sky-800 to-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <Link to="/" className="inline-flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/20">T</span>
                                <span className="font-display-lg text-2xl tracking-wide">TechStore</span>
                            </Link>
                            <h1 className="mt-16 max-w-sm text-4xl font-bold leading-tight">
                                Quản lý tài khoản và mua sắm đồng hồ dễ dàng hơn.
                            </h1>
                            <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
                                Đăng nhập để theo dõi đơn hàng, cập nhật hồ sơ, lưu giỏ hàng và nhận các ưu đãi mới nhất từ TechStore.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center text-xs text-white/80">
                            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                                <p className="text-lg font-bold text-white">COD</p>
                                <p>Thanh toán</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                                <p className="text-lg font-bold text-white">OTP</p>
                                <p>Bảo mật</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                                <p className="text-lg font-bold text-white">24/7</p>
                                <p>Theo dõi</p>
                            </div>
                        </div>
                    </aside>

                    <section className="flex min-h-[680px] flex-col justify-center px-5 py-8 sm:px-8 lg:px-12">
                        <header className="mb-8 flex items-center justify-between lg:hidden">
                            <Link to="/" className="font-display-lg text-2xl tracking-wide text-primary">TechStore</Link>
                            <Link to="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:text-primary">
                                Trang chủ
                            </Link>
                        </header>
                        <Outlet />
                    </section>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <Routes>
            {/* Khách chỉ được xem trang chủ, tìm kiếm và lọc sản phẩm trên trang chủ */}
            <Route path="/" element={<HomePage />} />

            {/* Các trang mua hàng/yêu cầu tài khoản */}
            <Route path="/product/:id" element={<RequireAuth><ProductDetailPage /></RequireAuth>} />
            <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
            <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><OrderHistoryPage /></RequireAuth>} />

            {/* KHU VỰC TÀI KHOẢN */}
            <Route element={<Shell />}>
                <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/verify-reset-otp" element={<VerifyResetOTP />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />

                <Route path="/user/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                <Route path="/admin/profile" element={<RequireAuth><AdminProfilePage /></RequireAuth>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
