import { Link } from 'react-router-dom';
import AppCard from '../ui/AppCard';
import AppButton from '../ui/AppButton';
import InputField from '../ui/InputField';
import FormAlert from '../ui/FormAlert';

export default function RegisterFormUI({ form, loading, errorMessage, successMessage, onFieldChange, onSubmit }) {
    const alertType = errorMessage ? 'error' : successMessage ? 'success' : '';
    const alertMessage = errorMessage || successMessage || '';

    return (
        <AppCard title="Đăng ký tài khoản" subtitle="Tạo tài khoản TechStore để mua hàng và theo dõi đơn dễ dàng hơn">
            <FormAlert type={alertType} message={alertMessage} />
            <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
                <InputField label="Họ và tên" name="fullName" value={form.fullName} onChange={(e) => onFieldChange('fullName', e.target.value)} placeholder="Nguyễn Văn A" required disabled={loading} />
                <InputField label="Email" name="email" type="email" value={form.email} onChange={(e) => onFieldChange('email', e.target.value)} placeholder="youremail@example.com" required disabled={loading} />
                <InputField label="Mật khẩu" name="password" type="password" value={form.password} onChange={(e) => onFieldChange('password', e.target.value)} placeholder="Tối thiểu 6 ký tự" required disabled={loading} allowPasswordToggle />
                <InputField label="Xác nhận mật khẩu" name="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => onFieldChange('confirmPassword', e.target.value)} placeholder="Nhập lại mật khẩu" required disabled={loading} allowPasswordToggle />

                <div className="space-y-3 pt-2">
                    <AppButton type="submit" fullWidth disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng ký ngay'}</AppButton>
                    <Link
                        to="/auth/login"
                        className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-primary"
                    >
                        Không muốn đăng ký? Quay lại đăng nhập
                    </Link>
                </div>
            </form>
        </AppCard>
    );
}
