import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import settingReducer from '../features/settings/settingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    dashboard: dashboardReducer,
    settings: settingReducer,
  },
});