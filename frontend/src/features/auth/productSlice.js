import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Get all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ search = '', page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products?search=${search}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', productData);
      toast.success('Product created successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create product');
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, data);
      toast.success('Product updated successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update product');
      return rejectWithValue(error.response?.data);
    }
  }
);

// Adjust stock
export const adjustStock = createAsyncThunk(
  'products/adjustStock',
  async ({ id, adjustment, note }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}/adjust-stock`, { adjustment, note });
      toast.success(`Stock adjusted by ${adjustment} units`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to adjust stock');
      return rejectWithValue(error.response?.data);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully!');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete product');
      return rejectWithValue(error.response?.data);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      // Adjust stock
      .addCase(adjustStock.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.product.id);
        if (index !== -1) {
          state.products[index] = action.payload.product;
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
        state.pagination.total -= 1;
      });
  },
});

export const { clearProductsError } = productSlice.actions;
export default productSlice.reducer;