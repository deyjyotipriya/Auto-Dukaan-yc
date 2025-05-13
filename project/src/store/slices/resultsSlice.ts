import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import ResultsManagementService, {
  ProcessingSession, 
  DetectionResult, 
  ResultsFilter, 
  ProcessingMetrics, 
  ReprocessingOptions
} from '../../services/ResultsManagementService';
import ProductDetectionService, { DetectedProduct } from '../../services/ProductDetectionService';
import ProductInformationService, { ProductInformation } from '../../services/ProductInformationService';

interface ResultsState {
  sessions: ProcessingSession[];
  currentSession: ProcessingSession | null;
  currentResults: DetectionResult[];
  detailResult: DetectionResult | null;
  metrics: ProcessingMetrics | null;
  filter: ResultsFilter;
  filteredResults: {
    results: DetectionResult[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  reprocessing: boolean;
}

const initialState: ResultsState = {
  sessions: [],
  currentSession: null,
  currentResults: [],
  detailResult: null,
  metrics: null,
  filter: {
    page: 1,
    pageSize: 10,
    sortBy: 'date',
    sortDirection: 'desc'
  },
  filteredResults: {
    results: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  },
  loading: false,
  error: null,
  reprocessing: false
};

// Async thunks

// Fetch all sessions
export const fetchSessions = createAsyncThunk(
  'results/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const sessions = ResultsManagementService.getAllSessions();
      return sessions;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Fetch session by ID
export const fetchSessionById = createAsyncThunk(
  'results/fetchSessionById',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const session = ResultsManagementService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Fetch results for a session
export const fetchSessionResults = createAsyncThunk(
  'results/fetchSessionResults',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const results = ResultsManagementService.getSessionResults(sessionId);
      return results;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Create a new session
export const createSession = createAsyncThunk(
  'results/createSession',
  async (
    { name, sourceType, sourceId }: { name: string; sourceType: 'livestream' | 'video' | 'images'; sourceId?: string },
    { rejectWithValue }
  ) => {
    try {
      const session = ResultsManagementService.createSession(name, sourceType, sourceId);
      return session;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Complete a session
export const completeSession = createAsyncThunk(
  'results/completeSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const session = ResultsManagementService.completeSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Add detection result
export const addDetectionResult = createAsyncThunk(
  'results/addDetectionResult',
  async (
    { sessionId, detectedProduct, productInformation }: 
    { sessionId: string; detectedProduct: DetectedProduct; productInformation?: ProductInformation },
    { rejectWithValue }
  ) => {
    try {
      const result = ResultsManagementService.addDetectionResult(sessionId, detectedProduct, productInformation);
      if (!result) {
        throw new Error('Failed to add detection result');
      }
      return result;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Update result status
export const updateResultStatus = createAsyncThunk(
  'results/updateResultStatus',
  async (
    { resultId, status, details }: 
    { resultId: string; status: DetectionResult['status']; details?: any },
    { rejectWithValue }
  ) => {
    try {
      const result = ResultsManagementService.updateResultStatus(resultId, status, details);
      if (!result) {
        throw new Error('Result not found');
      }
      return result;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Get result detail by ID
export const fetchResultDetail = createAsyncThunk(
  'results/fetchResultDetail',
  async (resultId: string, { rejectWithValue }) => {
    try {
      const result = ResultsManagementService.getResult(resultId);
      if (!result) {
        throw new Error('Result not found');
      }
      return result;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Update product information
export const updateProductInformation = createAsyncThunk(
  'results/updateProductInformation',
  async (
    { resultId, productInformation, manuallyEdited }: 
    { resultId: string; productInformation: ProductInformation; manuallyEdited?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const result = ResultsManagementService.updateProductInformation(resultId, productInformation, manuallyEdited);
      if (!result) {
        throw new Error('Result not found');
      }
      return result;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Filter results
export const filterResults = createAsyncThunk(
  'results/filterResults',
  async (filter: ResultsFilter, { rejectWithValue }) => {
    try {
      const filteredResults = ResultsManagementService.filterResults(filter);
      return { filter, filteredResults };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Calculate metrics
export const calculateMetrics = createAsyncThunk(
  'results/calculateMetrics',
  async (dateRange?: { start: Date; end: Date }, { rejectWithValue }) => {
    try {
      const metrics = ResultsManagementService.calculateMetrics(dateRange);
      return metrics;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Archive session
export const archiveSession = createAsyncThunk(
  'results/archiveSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const success = ResultsManagementService.archiveSession(sessionId);
      if (!success) {
        throw new Error('Failed to archive session');
      }
      return sessionId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Delete session
export const deleteSession = createAsyncThunk(
  'results/deleteSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const success = ResultsManagementService.deleteSession(sessionId);
      if (!success) {
        throw new Error('Failed to delete session');
      }
      return sessionId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Add tags to a result
export const addResultTags = createAsyncThunk(
  'results/addResultTags',
  async (
    { resultId, tags }: { resultId: string; tags: string[] },
    { rejectWithValue }
  ) => {
    try {
      const result = ResultsManagementService.addReviewTags(resultId, tags);
      if (!result) {
        throw new Error('Result not found');
      }
      return result;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Add notes to a result
export const addResultNotes = createAsyncThunk(
  'results/addResultNotes',
  async (
    { resultId, notes }: { resultId: string; notes: string },
    { rejectWithValue }
  ) => {
    try {
      const result = ResultsManagementService.addNotes(resultId, notes);
      if (!result) {
        throw new Error('Result not found');
      }
      return result;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Add tags to a session
export const addSessionTags = createAsyncThunk(
  'results/addSessionTags',
  async (
    { sessionId, tags }: { sessionId: string; tags: string[] },
    { rejectWithValue }
  ) => {
    try {
      const session = ResultsManagementService.addSessionTags(sessionId, tags);
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Reprocess results
export const reprocessResults = createAsyncThunk(
  'results/reprocessResults',
  async (options: ReprocessingOptions, { rejectWithValue }) => {
    try {
      const reprocessData = ResultsManagementService.prepareReprocessing(options);
      // In a real app, this would trigger the actual reprocessing
      // For now, we'll just return the reprocess data
      return reprocessData;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Export results
export const exportResults = createAsyncThunk(
  'results/exportResults',
  async (sessionId?: string, { rejectWithValue }) => {
    try {
      const exportData = ResultsManagementService.exportResults(sessionId);
      return exportData;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Results slice
const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<ResultsFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    resetFilter: (state) => {
      state.filter = {
        page: 1,
        pageSize: 10,
        sortBy: 'date',
        sortDirection: 'desc'
      };
    },
    clearDetailResult: (state) => {
      state.detailResult = null;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.currentResults = [];
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filter.page = action.payload;
    },
    resetResultsState: () => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch session by ID
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch session results
      .addCase(fetchSessionResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionResults.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResults = action.payload;
      })
      .addCase(fetchSessionResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create session
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.sessions.push(action.payload);
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Complete session
      .addCase(completeSession.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in sessions array
        const index = state.sessions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        
        // Update current session if it's the same one
        if (state.currentSession && state.currentSession.id === action.payload.id) {
          state.currentSession = action.payload;
        }
      })
      
      // Add detection result
      .addCase(addDetectionResult.fulfilled, (state, action) => {
        state.currentResults.push(action.payload);
        
        // Update session counts
        if (state.currentSession && state.currentSession.id === action.payload.sessionId) {
          state.currentSession.productsDetected += 1;
        }
      })
      
      // Update result status
      .addCase(updateResultStatus.fulfilled, (state, action) => {
        // Update in current results
        const index = state.currentResults.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.currentResults[index] = action.payload;
        }
        
        // Update detail result if it's the same one
        if (state.detailResult && state.detailResult.id === action.payload.id) {
          state.detailResult = action.payload;
        }
        
        // Update session counts if added to catalog
        if (action.payload.status === 'added_to_catalog' && 
            state.currentSession && 
            state.currentSession.id === action.payload.sessionId) {
          state.currentSession.productsAdded += 1;
        }
        
        // Also update in filtered results if present
        const filteredIndex = state.filteredResults.results.findIndex(r => r.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredResults.results[filteredIndex] = action.payload;
        }
      })
      
      // Fetch result detail
      .addCase(fetchResultDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detailResult = action.payload;
      })
      .addCase(fetchResultDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update product information
      .addCase(updateProductInformation.fulfilled, (state, action) => {
        // Update in current results
        const index = state.currentResults.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.currentResults[index] = action.payload;
        }
        
        // Update detail result if it's the same one
        if (state.detailResult && state.detailResult.id === action.payload.id) {
          state.detailResult = action.payload;
        }
        
        // Also update in filtered results if present
        const filteredIndex = state.filteredResults.results.findIndex(r => r.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredResults.results[filteredIndex] = action.payload;
        }
      })
      
      // Filter results
      .addCase(filterResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterResults.fulfilled, (state, action) => {
        state.loading = false;
        state.filter = action.payload.filter;
        state.filteredResults = action.payload.filteredResults;
      })
      .addCase(filterResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Calculate metrics
      .addCase(calculateMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(calculateMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Archive session
      .addCase(archiveSession.fulfilled, (state, action) => {
        // Update session status in the sessions array
        const index = state.sessions.findIndex(s => s.id === action.payload);
        if (index !== -1) {
          state.sessions[index].status = 'archived';
        }
        
        // Update current session if it's the same one
        if (state.currentSession && state.currentSession.id === action.payload) {
          state.currentSession.status = 'archived';
        }
      })
      
      // Delete session
      .addCase(deleteSession.fulfilled, (state, action) => {
        // Remove the session from the array
        state.sessions = state.sessions.filter(s => s.id !== action.payload);
        
        // Clear current session if it's the deleted one
        if (state.currentSession && state.currentSession.id === action.payload) {
          state.currentSession = null;
          state.currentResults = [];
        }
      })
      
      // Add tags to result
      .addCase(addResultTags.fulfilled, (state, action) => {
        // Update in current results
        const index = state.currentResults.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.currentResults[index] = action.payload;
        }
        
        // Update detail result if it's the same one
        if (state.detailResult && state.detailResult.id === action.payload.id) {
          state.detailResult = action.payload;
        }
        
        // Also update in filtered results if present
        const filteredIndex = state.filteredResults.results.findIndex(r => r.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredResults.results[filteredIndex] = action.payload;
        }
      })
      
      // Add notes to result
      .addCase(addResultNotes.fulfilled, (state, action) => {
        // Update in current results
        const index = state.currentResults.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.currentResults[index] = action.payload;
        }
        
        // Update detail result if it's the same one
        if (state.detailResult && state.detailResult.id === action.payload.id) {
          state.detailResult = action.payload;
        }
        
        // Also update in filtered results if present
        const filteredIndex = state.filteredResults.results.findIndex(r => r.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredResults.results[filteredIndex] = action.payload;
        }
      })
      
      // Add tags to session
      .addCase(addSessionTags.fulfilled, (state, action) => {
        // Update in sessions array
        const index = state.sessions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        
        // Update current session if it's the same one
        if (state.currentSession && state.currentSession.id === action.payload.id) {
          state.currentSession = action.payload;
        }
      })
      
      // Reprocess results
      .addCase(reprocessResults.pending, (state) => {
        state.reprocessing = true;
        state.error = null;
      })
      .addCase(reprocessResults.fulfilled, (state) => {
        state.reprocessing = false;
      })
      .addCase(reprocessResults.rejected, (state, action) => {
        state.reprocessing = false;
        state.error = action.payload as string;
      });
  }
});

// Actions
export const {
  setFilter,
  resetFilter,
  clearDetailResult,
  clearCurrentSession,
  setPage,
  resetResultsState
} = resultsSlice.actions;

// Selectors
export const selectSessions = (state: RootState) => state.results.sessions;
export const selectCurrentSession = (state: RootState) => state.results.currentSession;
export const selectCurrentResults = (state: RootState) => state.results.currentResults;
export const selectDetailResult = (state: RootState) => state.results.detailResult;
export const selectResultsFilter = (state: RootState) => state.results.filter;
export const selectFilteredResults = (state: RootState) => state.results.filteredResults;
export const selectResultsMetrics = (state: RootState) => state.results.metrics;
export const selectResultsLoading = (state: RootState) => state.results.loading;
export const selectResultsError = (state: RootState) => state.results.error;
export const selectReprocessingStatus = (state: RootState) => state.results.reprocessing;

// Select sessions by status
export const selectSessionsByStatus = (status: ProcessingSession['status']) => (state: RootState) => 
  state.results.sessions.filter(session => session.status === status);

// Select results by status
export const selectResultsByStatus = (status: DetectionResult['status']) => (state: RootState) => 
  state.results.currentResults.filter(result => result.status === status);

// Calculate stats for current session results
export const selectCurrentSessionStats = (state: RootState) => {
  const results = state.results.currentResults;
  
  const totalDetected = results.length;
  const addedToCatalog = results.filter(r => r.status === 'added_to_catalog').length;
  const rejected = results.filter(r => r.status === 'rejected').length;
  const pendingReview = results.filter(r => r.status === 'pending_review').length;
  const averageConfidence = results.length > 0 
    ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
    : 0;
  
  const categoryDistribution: Record<string, number> = {};
  results.forEach(result => {
    const category = result.detectedProduct.attributes.category?.value || 'Unknown';
    categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
  });
  
  return {
    totalDetected,
    addedToCatalog,
    rejected,
    pendingReview,
    conversionRate: totalDetected > 0 ? (addedToCatalog / totalDetected) * 100 : 0,
    averageConfidence,
    categoryDistribution
  };
};

export default resultsSlice.reducer;