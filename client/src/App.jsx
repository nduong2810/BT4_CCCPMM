import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
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

// Khung nền chỉ dùng cho các trang Đăng nhập / Profile
function Shell() {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe,_#f8fafc_55%)] px-4 py-10">
            <div className="mx-auto w-full max-w-3xl">
                <header className="mb-6 rounded-2xl border border-sky-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
                    <h1 className="text-2xl font-bold text-slate-900">TechStore</h1>
                </header>
                {/* Render các route con (VD: Login, Register) vào đây */}
                <Outlet />
            </div>
        </div>
    );
}

function App() {
    return (
        <Routes>
            {/* 1. KHU VỰC TRANG BÁN HÀNG (Full màn hình, không dùng Shell) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* Giỏ hàng, thanh toán và lịch sử đơn hàng */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />

            {/* 2. KHU VỰC TÀI KHOẢN (Bọc trong khung Shell) */}
            <Route element={<Shell />}>
                <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/verify-reset-otp" element={<VerifyResetOTP />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />

                {/* Profile */}
                <Route path="/user/profile" element={<ProfilePage />} />
                <Route path="/admin/profile" element={<AdminProfilePage />} />
            </Route>

            {/* 3. Bắt lỗi Route không tồn tại */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
