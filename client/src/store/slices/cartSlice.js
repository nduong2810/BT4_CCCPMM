import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCartData, addToCartAPI, updateCartItemAPI, removeCartItemAPI } from '../../services/cartService';

// --- Async Thunks ---

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try {
        const response = await getCartData();
        return response.data.cart;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to fetch cart');
    }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (data, { dispatch, rejectWithValue }) => {
    try {
        await addToCartAPI(data);
        // Sau khi thêm thành công, gọi fetchCart để lấy lại toàn bộ giỏ hàng mới nhất
        dispatch(fetchCart());
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to add to cart');
    }
});

// SỬA LỖI: Thunk để cập nhật số lượng
export const updateCartItem = createAsyncThunk(
    'cart/updateItem',
    async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
        try {
            await updateCartItemAPI(productId, quantity);
            // Sau khi cập nhật thành công, gọi fetchCart để đảm bảo dữ liệu đồng bộ
            dispatch(fetchCart());
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update item');
        }
    }
);

// SỬA LỖI: Thunk để xóa sản phẩm
export const removeCartItem = createAsyncThunk(
    'cart/removeItem',
    async (productId, { dispatch, rejectWithValue }) => {
        try {
            await removeCartItemAPI(productId);
            // Sau khi xóa thành công, gọi fetchCart để làm mới giỏ hàng
            dispatch(fetchCart());
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to remove item');
        }
    }
);

// --- Slice Definition ---

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        totalPrice: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // --- Xử lý các trường hợp cụ thể (addCase) ---
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalPrice = action.payload.totalPrice;
                state.error = null;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Các action update và remove không cần xử lý fulfilled nữa
            // vì chúng sẽ trigger fetchCart, và logic đã được xử lý ở trên.
            // Chúng ta chỉ cần xử lý trạng thái loading cho chúng.
            .addMatcher(
                (action) => action.type.startsWith('cart/') && action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                }
            )
            .addMatcher(
                (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
                (state, action) => {
                    // Khi có lỗi, dừng loading và fetch lại giỏ hàng để khôi phục trạng thái đúng
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export default cartSlice.reducer;