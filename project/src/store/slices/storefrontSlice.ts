import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import StorefrontService, { 
  StorefrontConfig, 
  PageType,
  SectionConfig,
  CategoryConfig,
  SEOSettings,
  SocialMediaLinks,
  defaultStorefrontConfig
} from '../../services/StorefrontService';

interface StorefrontState {
  config: StorefrontConfig | null;
  previewUrl: string | null;
  liveUrl: string | null;
  isPublished: boolean;
  isEditing: boolean;
  currentEditingPageType: PageType | null;
  currentEditingSectionIndex: number | null;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  lastPublished: Date | null;
}

const initialState: StorefrontState = {
  config: null,
  previewUrl: null,
  liveUrl: null,
  isPublished: false,
  isEditing: false,
  currentEditingPageType: null,
  currentEditingSectionIndex: null,
  isDirty: false,
  isLoading: false,
  error: null,
  lastPublished: null,
};

// Create a new storefront
export const createStorefront = createAsyncThunk(
  'storefront/create',
  async ({ businessName, businessId }: { businessName: string; businessId: string }, { rejectWithValue }) => {
    try {
      const config = StorefrontService.generateDefaultStorefront(businessName, businessId);
      return config;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Publish the storefront
export const publishStorefront = createAsyncThunk(
  'storefront/publish',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const config = state.storefront.config;
      
      if (!config) {
        throw new Error('No storefront configuration to publish');
      }

      // This would actually publish the storefront to a live server
      // For now, we just simulate it by generating URLs
      const liveUrl = StorefrontService.getLiveUrl(config);
      
      return { liveUrl, publishedAt: new Date() };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Generate a preview
export const generatePreview = createAsyncThunk(
  'storefront/preview',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const config = state.storefront.config;
      
      if (!config) {
        throw new Error('No storefront configuration to preview');
      }

      const previewUrl = StorefrontService.getPreviewUrl(config);
      return previewUrl;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const storefrontSlice = createSlice({
  name: 'storefront',
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<StorefrontConfig>) => {
      state.config = action.payload;
      state.isDirty = true;
    },
    startEditing: (state, action: PayloadAction<{ pageType: PageType; sectionIndex?: number }>) => {
      state.isEditing = true;
      state.currentEditingPageType = action.payload.pageType;
      state.currentEditingSectionIndex = action.payload.sectionIndex ?? null;
    },
    stopEditing: (state) => {
      state.isEditing = false;
      state.currentEditingPageType = null;
      state.currentEditingSectionIndex = null;
    },
    updateTheme: (state, action: PayloadAction<{ theme: string; colorScheme: string }>) => {
      if (state.config) {
        state.config.theme = action.payload.theme as any;
        state.config.colorScheme = action.payload.colorScheme as any;
        state.config.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    updateCustomColors: (state, action: PayloadAction<Record<string, string>>) => {
      if (state.config) {
        state.config.customColors = action.payload as any;
        state.config.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    updateBusinessInfo: (state, action: PayloadAction<{ businessName: string; logo?: string; favicon?: string }>) => {
      if (state.config) {
        state.config = {
          ...state.config,
          ...action.payload,
          updatedAt: new Date(),
        };
        state.isDirty = true;
      }
    },
    updateSection: (state, action: PayloadAction<{ pageType: PageType; sectionIndex: number; updates: Partial<SectionConfig> }>) => {
      if (state.config) {
        const { pageType, sectionIndex, updates } = action.payload;
        
        const pageIndex = state.config.pages.findIndex(p => p.type === pageType);
        if (pageIndex !== -1 && state.config.pages[pageIndex].sections[sectionIndex]) {
          state.config.pages[pageIndex].sections[sectionIndex] = {
            ...state.config.pages[pageIndex].sections[sectionIndex],
            ...updates,
          };
          state.config.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },
    addSection: (state, action: PayloadAction<{ pageType: PageType; section: Omit<SectionConfig, 'order'> }>) => {
      if (state.config) {
        const { pageType, section } = action.payload;
        
        const pageIndex = state.config.pages.findIndex(p => p.type === pageType);
        if (pageIndex !== -1) {
          const newSection = {
            ...section,
            order: state.config.pages[pageIndex].sections.length,
          };
          
          state.config.pages[pageIndex].sections.push(newSection);
          state.config.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },
    removeSection: (state, action: PayloadAction<{ pageType: PageType; sectionIndex: number }>) => {
      if (state.config) {
        const { pageType, sectionIndex } = action.payload;
        
        const pageIndex = state.config.pages.findIndex(p => p.type === pageType);
        if (pageIndex !== -1) {
          state.config.pages[pageIndex].sections = state.config.pages[pageIndex].sections.filter((_, index) => index !== sectionIndex);
          state.config.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },
    addCategory: (state, action: PayloadAction<Omit<CategoryConfig, 'id' | 'order'>>) => {
      if (state.config) {
        const newCategory: CategoryConfig = {
          ...action.payload,
          id: Date.now().toString(),
          order: state.config.categories.length,
        };
        
        state.config.categories.push(newCategory);
        state.config.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    updateCategory: (state, action: PayloadAction<{ id: string; updates: Partial<CategoryConfig> }>) => {
      if (state.config) {
        const { id, updates } = action.payload;
        
        const categoryIndex = state.config.categories.findIndex(c => c.id === id);
        if (categoryIndex !== -1) {
          state.config.categories[categoryIndex] = {
            ...state.config.categories[categoryIndex],
            ...updates,
          };
          state.config.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      if (state.config) {
        state.config.categories = state.config.categories.filter(c => c.id !== action.payload);
        state.config.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    updateSEO: (state, action: PayloadAction<Partial<SEOSettings>>) => {
      if (state.config) {
        state.config.seo = {
          ...state.config.seo,
          ...action.payload,
        };
        state.config.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    updateSocialMedia: (state, action: PayloadAction<SocialMediaLinks[]>) => {
      if (state.config) {
        state.config.socialMedia = action.payload;
        state.config.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    updateContactInfo: (state, action: PayloadAction<Partial<StorefrontConfig['contactInfo']>>) => {
      if (state.config) {
        state.config.contactInfo = {
          ...state.config.contactInfo,
          ...action.payload,
        };
        state.config.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    updateLegalPages: (state, action: PayloadAction<Partial<StorefrontConfig['legalPages']>>) => {
      if (state.config) {
        state.config.legalPages = {
          ...state.config.legalPages,
          ...action.payload,
        };
        state.config.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    resetDirtyFlag: (state) => {
      state.isDirty = false;
    },
    resetStorefront: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create storefront
      .addCase(createStorefront.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStorefront.fulfilled, (state, action) => {
        state.isLoading = false;
        state.config = action.payload;
        state.previewUrl = StorefrontService.getPreviewUrl(action.payload);
        state.liveUrl = null;
        state.isPublished = false;
        state.isDirty = true;
      })
      .addCase(createStorefront.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Publish storefront
      .addCase(publishStorefront.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(publishStorefront.fulfilled, (state, action) => {
        state.isLoading = false;
        state.liveUrl = action.payload.liveUrl;
        state.isPublished = true;
        state.lastPublished = action.payload.publishedAt;
        state.isDirty = false;
      })
      .addCase(publishStorefront.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Generate preview
      .addCase(generatePreview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generatePreview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.previewUrl = action.payload;
      })
      .addCase(generatePreview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setConfig,
  startEditing,
  stopEditing,
  updateTheme,
  updateCustomColors,
  updateBusinessInfo,
  updateSection,
  addSection,
  removeSection,
  addCategory,
  updateCategory,
  removeCategory,
  updateSEO,
  updateSocialMedia,
  updateContactInfo,
  updateLegalPages,
  resetDirtyFlag,
  resetStorefront,
} = storefrontSlice.actions;

// Selectors
export const selectStorefrontConfig = (state: RootState) => state.storefront.config;
export const selectIsStorefrontPublished = (state: RootState) => state.storefront.isPublished;
export const selectStorefrontPreviewUrl = (state: RootState) => state.storefront.previewUrl;
export const selectStorefrontLiveUrl = (state: RootState) => state.storefront.liveUrl;
export const selectIsStorefrontDirty = (state: RootState) => state.storefront.isDirty;
export const selectStorefrontError = (state: RootState) => state.storefront.error;
export const selectIsStorefrontLoading = (state: RootState) => state.storefront.isLoading;
export const selectStorefrontLastPublished = (state: RootState) => state.storefront.lastPublished;

// Get sections for a specific page
export const selectPageSections = (state: RootState, pageType: PageType) => {
  if (!state.storefront.config) return [];
  const page = state.storefront.config.pages.find(p => p.type === pageType);
  return page ? page.sections : [];
};

// Get categories with their sorting order
export const selectSortedCategories = (state: RootState) => {
  if (!state.storefront.config) return [];
  return [...state.storefront.config.categories].sort((a, b) => a.order - b.order);
};

// Get only featured categories
export const selectFeaturedCategories = (state: RootState) => {
  if (!state.storefront.config) return [];
  return state.storefront.config.categories.filter(c => c.featured);
};

export default storefrontSlice.reducer;