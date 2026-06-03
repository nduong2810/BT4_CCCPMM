import { Link } from 'react-router-dom';
import AppCard from '../ui/AppCard';
import AppButton from '../ui/AppButton';
import InputField from '../ui/InputField';
import FormAlert from '../ui/FormAlert';

export default function LoginFormUI({ form, loading, errorMessage, successMessage, onFieldChange, onSubmit }) {
  const alertType = errorMessage ? 'error' : successMessage ? 'success' : '';
  const alertMessage = errorMessage || successMessage || '';

  return (
    <AppCard title="Đăng nhập" subtitle="Chào mừng bạn quay trở lại TechStore">
      <FormAlert type={alertType} message={alertMessage} />

      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <InputField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(event) => onFieldChange('email', event.target.value)}
          placeholder="youremail@example.com"
          required
          disabled={loading}
        />

        <InputField
          label="Mật khẩu"
          name="password"
          type="password"
          value={form.password}
          onChange={(event) => onFieldChange('password', event.target.value)}
          placeholder="Nhập mật khẩu"
          allowPasswordToggle
          required
          disabled={loading}
        />

        <div className="flex items-center justify-end">
          <Link to="/auth/forgot-password" className="text-sm font-semibold text-sky-700 hover:text-sky-900">
            Quên mật khẩu?
          </Link>
        </div>

        <AppButton type="submit" fullWidth disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </AppButton>
      </form>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-primary"
        >
          Về trang chủ
        </Link>
        <Link
          to="/auth/register"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-primary"
        >
          Đăng ký tài khoản
        </Link>
      </div>
    </AppCard>
  );
}
