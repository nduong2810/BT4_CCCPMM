import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCartData, addToCartAPI, updateCartItemAPI, removeCartItemAPI } from '../../services/cartService';

// 1. Khởi tạo các AsyncThunk gọi API
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try {
        const response = await getCartData();
        return response.data.cart;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (data, { rejectWithValue }) => {
    try {
        const response = await addToCartAPI(data);
        return response.data.cart;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async (data, { rejectWithValue }) => {
    try {
        const response = await updateCartItemAPI(data);
        return response.data.cart;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

export const removeCartItem = createAsyncThunk('cart/removeCartItem', async (productId, { rejectWithValue }) => {
    try {
        const response = await removeCartItemAPI(productId);
        return response.data.cart;
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

// 2. Khởi tạo Slice
const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        totalPrice: 0,
        loading: true // Vừa vào trang là bật loading luôn
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ============ LẤY GIỎ HÀNG (FETCH) ============
            .addCase(fetchCart.pending, (state) => {
                state.loading = true; // Đang gọi API -> Quay loading
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false; // Xong rồi -> Tắt loading
                state.items = action.payload?.items || [];
                state.totalPrice = action.payload?.totalPrice || 0;
            })
            .addCase(fetchCart.rejected, (state) => {
                state.loading = false; // Lỗi (vd: chưa đăng nhập) -> Vẫn phải tắt loading
                state.items = [];
                state.totalPrice = 0;
            })

            // ============ THÊM / SỬA / XÓA ============
            // (Chỉ cần cập nhật lại giỏ hàng sau khi các hành động này thành công)
            .addCase(addToCart.fulfilled, (state, action) => {
                state.items = action.payload?.items || [];
                state.totalPrice = action.payload?.totalPrice || 0;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.items = action.payload?.items || [];
                state.totalPrice = action.payload?.totalPrice || 0;
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.items = action.payload?.items || [];
                state.totalPrice = action.payload?.totalPrice || 0;
            });
    }
});

export default cartSlice.reducer;