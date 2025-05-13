import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import chatReducer from './slices/chatSlice';
import storefrontReducer from './slices/storefrontSlice';
import livestreamReducer from './slices/livestreamSlice';
import resultsReducer from './slices/resultsSlice';
import buyerReducer from './slices/buyerSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    products: productsReducer,
    orders: ordersReducer,
    chat: chatReducer,
    storefront: storefrontReducer,
    livestream: livestreamReducer,
    results: resultsReducer,
    buyer: buyerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;