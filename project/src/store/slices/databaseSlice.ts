import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  DatabaseService, 
  ProductRecord, 
  CapturedFrameRecord, 
  SessionRecord,
  CatalogRecord
} from '../../services/DatabaseService';

// Define the state interfaces
interface DatabaseState {
  products: {
    items: ProductRecord[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  frames: {
    items: CapturedFrameRecord[];
    selectedSessionId: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  sessions: {
    items: SessionRecord[];
    currentSessionId: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  catalogs: {
    items: CatalogRecord[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
}

// Define the initial state
const initialState: DatabaseState = {
  products: {
    items: [],
    status: 'idle',
    error: null
  },
  frames: {
    items: [],
    selectedSessionId: null,
    status: 'idle',
    error: null
  },
  sessions: {
    items: [],
    currentSessionId: null,
    status: 'idle',
    error: null
  },
  catalogs: {
    items: [],
    status: 'idle',
    error: null
  }
};

// Async thunks for products
export const fetchProducts = createAsyncThunk(
  'database/fetchProducts',
  async () => {
    return await DatabaseService.getAllProducts();
  }
);

export const createProduct = createAsyncThunk(
  'database/createProduct',
  async (product: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const productId = await DatabaseService.createProduct(product);
    return await DatabaseService.getProduct(productId);
  }
);

export const updateProduct = createAsyncThunk(
  'database/updateProduct',
  async (product: ProductRecord) => {
    await DatabaseService.updateProduct(product);
    return product;
  }
);

export const deleteProduct = createAsyncThunk(
  'database/deleteProduct',
  async (productId: string) => {
    await DatabaseService.deleteProduct(productId);
    return productId;
  }
);

// Async thunks for frames
export const fetchFrames = createAsyncThunk(
  'database/fetchFrames',
  async (sessionId: string | null = null) => {
    if (sessionId) {
      return await DatabaseService.getFramesBySession(sessionId);
    } else {
      return await DatabaseService.getAllCapturedFrames();
    }
  }
);

export const saveFrame = createAsyncThunk(
  'database/saveFrame',
  async (frame: CapturedFrameRecord) => {
    await DatabaseService.saveCapturedFrame(frame);
    return frame;
  }
);

export const updateFrame = createAsyncThunk(
  'database/updateFrame',
  async (frame: CapturedFrameRecord) => {
    await DatabaseService.updateCapturedFrame(frame);
    return frame;
  }
);

export const deleteFrame = createAsyncThunk(
  'database/deleteFrame',
  async (frameId: string) => {
    await DatabaseService.deleteCapturedFrame(frameId);
    return frameId;
  }
);

// Async thunks for sessions
export const fetchSessions = createAsyncThunk(
  'database/fetchSessions',
  async () => {
    return await DatabaseService.getAllSessions();
  }
);

export const createSession = createAsyncThunk(
  'database/createSession',
  async (session: Omit<SessionRecord, 'id'>) => {
    const sessionId = await DatabaseService.createSession(session);
    return await DatabaseService.getSession(sessionId);
  }
);

export const updateSession = createAsyncThunk(
  'database/updateSession',
  async (session: SessionRecord) => {
    await DatabaseService.updateSession(session);
    return session;
  }
);

export const deleteSession = createAsyncThunk(
  'database/deleteSession',
  async (sessionId: string) => {
    await DatabaseService.deleteSession(sessionId);
    return sessionId;
  }
);

// Async thunks for catalogs
export const fetchCatalogs = createAsyncThunk(
  'database/fetchCatalogs',
  async () => {
    return await DatabaseService.getAllCatalogs();
  }
);

export const createCatalog = createAsyncThunk(
  'database/createCatalog',
  async (catalog: Omit<CatalogRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const catalogId = await DatabaseService.createCatalog(catalog);
    return await DatabaseService.getCatalog(catalogId);
  }
);

// Create the slice
const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    setSelectedSessionId: (state, action: PayloadAction<string | null>) => {
      state.frames.selectedSessionId = action.payload;
    },
    setCurrentSessionId: (state, action: PayloadAction<string | null>) => {
      state.sessions.currentSessionId = action.payload;
    },
    clearFrames: (state) => {
      state.frames.items = [];
      state.frames.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    // Products reducers
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.products.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products.status = 'succeeded';
        state.products.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.products.status = 'failed';
        state.products.error = action.error.message || null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        if (action.payload) {
          state.products.items.push(action.payload);
        }
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products.items[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products.items = state.products.items.filter(p => p.id !== action.payload);
      })
      
      // Frames reducers
      .addCase(fetchFrames.pending, (state) => {
        state.frames.status = 'loading';
      })
      .addCase(fetchFrames.fulfilled, (state, action) => {
        state.frames.status = 'succeeded';
        state.frames.items = action.payload;
      })
      .addCase(fetchFrames.rejected, (state, action) => {
        state.frames.status = 'failed';
        state.frames.error = action.error.message || null;
      })
      .addCase(saveFrame.fulfilled, (state, action) => {
        state.frames.items.push(action.payload);
      })
      .addCase(updateFrame.fulfilled, (state, action) => {
        const index = state.frames.items.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.frames.items[index] = action.payload;
        }
      })
      .addCase(deleteFrame.fulfilled, (state, action) => {
        state.frames.items = state.frames.items.filter(f => f.id !== action.payload);
      })
      
      // Sessions reducers
      .addCase(fetchSessions.pending, (state) => {
        state.sessions.status = 'loading';
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions.status = 'succeeded';
        state.sessions.items = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.sessions.status = 'failed';
        state.sessions.error = action.error.message || null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.sessions.items.push(action.payload);
          // Set as current session
          state.sessions.currentSessionId = action.payload.id;
        }
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        const index = state.sessions.items.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sessions.items[index] = action.payload;
        }
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions.items = state.sessions.items.filter(s => s.id !== action.payload);
        // Clear current session if it was deleted
        if (state.sessions.currentSessionId === action.payload) {
          state.sessions.currentSessionId = null;
        }
      })
      
      // Catalogs reducers
      .addCase(fetchCatalogs.pending, (state) => {
        state.catalogs.status = 'loading';
      })
      .addCase(fetchCatalogs.fulfilled, (state, action) => {
        state.catalogs.status = 'succeeded';
        state.catalogs.items = action.payload;
      })
      .addCase(fetchCatalogs.rejected, (state, action) => {
        state.catalogs.status = 'failed';
        state.catalogs.error = action.error.message || null;
      })
      .addCase(createCatalog.fulfilled, (state, action) => {
        if (action.payload) {
          state.catalogs.items.push(action.payload);
        }
      });
  }
});

export const { setSelectedSessionId, setCurrentSessionId, clearFrames } = databaseSlice.actions;
export default databaseSlice.reducer;