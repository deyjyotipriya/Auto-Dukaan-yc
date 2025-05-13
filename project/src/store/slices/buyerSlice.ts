import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

// Types
export interface BuyerState {
  isAuthenticated: boolean;
  buyer: Buyer | null;
  recentlyViewed: string[];
  cart: CartItem[];
  wishlist: string[];
  isGuest: boolean;
  loading: boolean;
  error: string | null;
  isFirstTimeVisitor: boolean;
}

export interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  defaultAddressId?: string;
  lastLogin: string;
}

export interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: string;
  addedAt: string;
}

// Async thunks
export const loginBuyer = createAsyncThunk(
  'buyer/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // Mock implementation for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        id: 'buyer-123',
        name: 'Sample Buyer',
        email: credentials.email,
        phone: '9876543210',
        addresses: [],
        lastLogin: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue('Authentication failed. Please check your credentials.');
    }
  }
);

export const registerBuyer = createAsyncThunk(
  'buyer/register',
  async (data: { name: string; email: string; phone: string; password: string }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // Mock implementation for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        id: 'buyer-' + Math.floor(Math.random() * 1000),
        name: data.name,
        email: data.email,
        phone: data.phone,
        addresses: [],
        lastLogin: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue('Registration failed. Please try again.');
    }
  }
);

export const guestLogin = createAsyncThunk(
  'buyer/guestLogin',
  async (_, { rejectWithValue }) => {
    try {
      // Generate a unique guest ID
      const guestId = 'guest-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      
      return {
        id: guestId,
        name: 'Guest User',
        email: '',
        phone: '',
        addresses: [],
        lastLogin: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue('Failed to create guest session.');
    }
  }
);

// Initial state
const initialState: BuyerState = {
  isAuthenticated: false,
  buyer: null,
  recentlyViewed: [],
  cart: [],
  wishlist: [],
  isGuest: false,
  loading: false,
  error: null,
  isFirstTimeVisitor: true,
};

// Slice
const buyerSlice = createSlice({
  name: 'buyer',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.buyer = null;
      state.isGuest = false;
      // Keep cart and recently viewed for later
    },
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'addedAt'>>) => {
      const { productId, quantity, variant } = action.payload;
      const existingItemIndex = state.cart.findIndex(
        item => item.productId === productId && (variant ? item.variant === variant : !item.variant)
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        state.cart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        state.cart.push({
          productId,
          quantity,
          variant,
          addedAt: new Date().toISOString(),
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string; variant?: string }>) => {
      const { productId, variant } = action.payload;
      state.cart = state.cart.filter(
        item => !(item.productId === productId && (variant ? item.variant === variant : !item.variant))
      );
    },
    updateCartQuantity: (state, action: PayloadAction<{ productId: string; variant?: string; quantity: number }>) => {
      const { productId, variant, quantity } = action.payload;
      const item = state.cart.find(
        item => item.productId === productId && (variant ? item.variant === variant : !item.variant)
      );
      if (item) {
        item.quantity = quantity;
      }
    },
    addToWishlist: (state, action: PayloadAction<string>) => {
      if (!state.wishlist.includes(action.payload)) {
        state.wishlist.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter(id => id !== action.payload);
    },
    addToRecentlyViewed: (state, action: PayloadAction<string>) => {
      // Remove if already exists (to move to front)
      state.recentlyViewed = state.recentlyViewed.filter(id => id !== action.payload);
      // Add to front
      state.recentlyViewed.unshift(action.payload);
      // Keep only the most recent 10
      state.recentlyViewed = state.recentlyViewed.slice(0, 10);
    },
    clearFirstTimeVisitor: (state) => {
      state.isFirstTimeVisitor = false;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginBuyer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginBuyer.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.buyer = action.payload;
      state.isGuest = false;
      state.loading = false;
      state.isFirstTimeVisitor = false;
    });
    builder.addCase(loginBuyer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Register
    builder.addCase(registerBuyer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerBuyer.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.buyer = action.payload;
      state.isGuest = false;
      state.loading = false;
      state.isFirstTimeVisitor = false;
    });
    builder.addCase(registerBuyer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Guest Login
    builder.addCase(guestLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(guestLogin.fulfilled, (state, action) => {
      state.isAuthenticated = false;
      state.buyer = action.payload;
      state.isGuest = true;
      state.loading = false;
      state.isFirstTimeVisitor = false;
    });
    builder.addCase(guestLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Selectors
export const selectBuyer = (state: RootState) => state.buyer.buyer;
export const selectIsAuthenticated = (state: RootState) => state.buyer.isAuthenticated;
export const selectIsGuest = (state: RootState) => state.buyer.isGuest;
export const selectCart = (state: RootState) => state.buyer.cart;
export const selectWishlist = (state: RootState) => state.buyer.wishlist;
export const selectRecentlyViewed = (state: RootState) => state.buyer.recentlyViewed;
export const selectBuyerLoading = (state: RootState) => state.buyer.loading;
export const selectBuyerError = (state: RootState) => state.buyer.error;
export const selectIsFirstTimeVisitor = (state: RootState) => state.buyer.isFirstTimeVisitor;

// Export actions and reducer
export const { 
  logout, 
  addToCart, 
  removeFromCart, 
  updateCartQuantity, 
  addToWishlist, 
  removeFromWishlist, 
  addToRecentlyViewed,
  clearFirstTimeVisitor
} = buyerSlice.actions;

export default buyerSlice.reducer;