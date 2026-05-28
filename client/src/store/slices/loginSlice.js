import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loginUser } from '../../services/authService';

const savedUser = (() => {
  try {
    const rawUser = localStorage.getItem('currentUser');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    localStorage.removeItem('currentUser');
    return null;
  }
})();

const initialState = {
  form: {
    email: '',
    password: '',
  },
  loading: false,
  successMessage: '',
  errorMessage: '',
  user: savedUser,
  redirectUrl: '',
  isAuthenticated: Boolean(savedUser),
};

const extractError = (error) => {
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length) return errors[0].msg;
  return error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
};

export const loginThunk = createAsyncThunk(
  'login/submit',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { email, password } = getState().login.form;
      const response = await loginUser(email.trim(), password);
      return response.data;
    } catch (error) {
      return rejectWithValue(extractError(error));
    }
  },
);

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoginField: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    clearLoginMessages: (state) => {
      state.errorMessage = '';
      state.successMessage = '';
    },
    setCurrentUser: (state, action) => {
      state.user = action.payload || null;
      state.isAuthenticated = Boolean(action.payload);
      if (action.payload) {
        localStorage.setItem('currentUser', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('currentUser');
      }
    },
    resetLoginState: () => {
      localStorage.removeItem('currentUser');
      return {
        ...initialState,
        user: null,
        isAuthenticated: false,
        successMessage: '',
        errorMessage: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        const user = action.payload.user || null;
        state.loading = false;
        state.successMessage = action.payload.message || 'Đăng nhập thành công.';
        state.user = user;
        state.redirectUrl = action.payload.redirectUrl || '/';
        state.isAuthenticated = Boolean(user);
        state.form.password = '';

        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload || 'Đăng nhập thất bại.';
        state.isAuthenticated = false;
      });
  },
});

export const { setLoginField, clearLoginMessages, setCurrentUser, resetLoginState } = loginSlice.actions;
export default loginSlice.reducer;
