import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import LivestreamService, {
  StreamSession,
  StreamStatus,
  StreamVisibility,
  StreamQuality,
  StreamComment,
  StreamDetectedProduct,
  StreamAnalytics,
  CreateStreamParams
} from '../../services/LivestreamService';

interface LivestreamState {
  currentStream: StreamSession | null;
  scheduledStreams: StreamSession[];
  pastStreams: StreamSession[];
  isLoading: boolean;
  error: string | null;
  streamAnalytics: StreamAnalytics | null;
  isPublishing: boolean;
  publishedProducts: string[];
  isRecording: boolean;
  cameraPermission: boolean;
  microphonePermission: boolean;
}

const initialState: LivestreamState = {
  currentStream: null,
  scheduledStreams: [],
  pastStreams: [],
  isLoading: false,
  error: null,
  streamAnalytics: null,
  isPublishing: false,
  publishedProducts: [],
  isRecording: false,
  cameraPermission: false,
  microphonePermission: false,
};

// Create a new livestream
export const createLivestream = createAsyncThunk(
  'livestream/create',
  async (params: CreateStreamParams, { rejectWithValue }) => {
    try {
      const stream = LivestreamService.createStreamSession(params);
      return stream;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Start a livestream
export const startLivestream = createAsyncThunk(
  'livestream/start',
  async (streamId: string, { rejectWithValue }) => {
    try {
      const stream = LivestreamService.startStream(streamId);
      if (!stream) {
        throw new Error('Stream not found');
      }
      return stream;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// End a livestream
export const endLivestream = createAsyncThunk(
  'livestream/end',
  async (streamId: string, { rejectWithValue }) => {
    try {
      const stream = LivestreamService.endStream(streamId);
      if (!stream) {
        throw new Error('Stream not found');
      }
      return stream;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Schedule a future livestream
export const scheduleLivestream = createAsyncThunk(
  'livestream/schedule',
  async (params: CreateStreamParams & { scheduledFor: Date }, { rejectWithValue }) => {
    try {
      const stream = LivestreamService.scheduleStream(params);
      return stream;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Get analytics for a stream
export const getStreamAnalytics = createAsyncThunk(
  'livestream/analytics',
  async (streamId: string, { rejectWithValue }) => {
    try {
      const analytics = LivestreamService.getStreamAnalytics(streamId);
      if (!analytics) {
        throw new Error('Analytics not available');
      }
      return analytics;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Add comment to livestream
export const addStreamComment = createAsyncThunk(
  'livestream/addComment',
  async ({ 
    streamId, 
    comment 
  }: { 
    streamId: string; 
    comment: Omit<StreamComment, 'id' | 'timestamp' | 'reactions'> 
  }, { rejectWithValue }) => {
    try {
      const newComment = LivestreamService.addComment(streamId, comment);
      if (!newComment) {
        throw new Error('Failed to add comment');
      }
      return { streamId, comment: newComment };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Publish product from stream
export const publishStreamProduct = createAsyncThunk(
  'livestream/publishProduct',
  async ({ 
    streamId, 
    productId 
  }: { 
    streamId: string; 
    productId: string 
  }, { rejectWithValue, dispatch }) => {
    try {
      const success = LivestreamService.publishProduct(streamId, productId);
      if (!success) {
        throw new Error('Failed to publish product');
      }
      return { streamId, productId };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const livestreamSlice = createSlice({
  name: 'livestream',
  initialState,
  reducers: {
    setCurrentStream: (state, action: PayloadAction<StreamSession>) => {
      state.currentStream = action.payload;
    },
    clearCurrentStream: (state) => {
      state.currentStream = null;
    },
    addDetectedProduct: (state, action: PayloadAction<StreamDetectedProduct>) => {
      if (state.currentStream) {
        state.currentStream.detectedProducts.push(action.payload);
      }
    },
    setStreamTitle: (state, action: PayloadAction<string>) => {
      if (state.currentStream) {
        state.currentStream.title = action.payload;
      }
    },
    setStreamDescription: (state, action: PayloadAction<string>) => {
      if (state.currentStream) {
        state.currentStream.description = action.payload;
      }
    },
    setStreamVisibility: (state, action: PayloadAction<StreamVisibility>) => {
      if (state.currentStream) {
        state.currentStream.visibility = action.payload;
      }
    },
    setStreamQuality: (state, action: PayloadAction<StreamQuality>) => {
      if (state.currentStream) {
        state.currentStream.quality = action.payload;
      }
    },
    setCameraPermission: (state, action: PayloadAction<boolean>) => {
      state.cameraPermission = action.payload;
    },
    setMicrophonePermission: (state, action: PayloadAction<boolean>) => {
      state.microphonePermission = action.payload;
    },
    setIsRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    addReaction: (state, action: PayloadAction<{ type: string }>) => {
      if (state.currentStream) {
        const existingReactionIndex = state.currentStream.reactions.findIndex(
          r => r.type === action.payload.type
        );

        if (existingReactionIndex >= 0) {
          state.currentStream.reactions[existingReactionIndex].count += 1;
          state.currentStream.reactions[existingReactionIndex].timestamp = new Date();
        } else {
          state.currentStream.reactions.push({
            type: action.payload.type,
            count: 1,
            timestamp: new Date()
          });
        }
      }
    },
    resetLivestreamState: () => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create livestream
      .addCase(createLivestream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLivestream.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStream = action.payload;
      })
      .addCase(createLivestream.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Start livestream
      .addCase(startLivestream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startLivestream.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStream = action.payload;
      })
      .addCase(startLivestream.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // End livestream
      .addCase(endLivestream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endLivestream.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStream = null;
        state.pastStreams = [action.payload, ...state.pastStreams];
      })
      .addCase(endLivestream.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Schedule livestream
      .addCase(scheduleLivestream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(scheduleLivestream.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduledStreams = [...state.scheduledStreams, action.payload];
      })
      .addCase(scheduleLivestream.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get stream analytics
      .addCase(getStreamAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStreamAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.streamAnalytics = action.payload;
      })
      .addCase(getStreamAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add stream comment
      .addCase(addStreamComment.fulfilled, (state, action) => {
        if (state.currentStream && state.currentStream.id === action.payload.streamId) {
          state.currentStream.comments.push(action.payload.comment);
        }
      })
      
      // Publish stream product
      .addCase(publishStreamProduct.pending, (state) => {
        state.isPublishing = true;
        state.error = null;
      })
      .addCase(publishStreamProduct.fulfilled, (state, action) => {
        state.isPublishing = false;
        if (state.currentStream && state.currentStream.id === action.payload.streamId) {
          if (!state.currentStream.publishedProducts.includes(action.payload.productId)) {
            state.currentStream.publishedProducts.push(action.payload.productId);
          }
        }
        if (!state.publishedProducts.includes(action.payload.productId)) {
          state.publishedProducts.push(action.payload.productId);
        }
      })
      .addCase(publishStreamProduct.rejected, (state, action) => {
        state.isPublishing = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentStream,
  clearCurrentStream,
  addDetectedProduct,
  setStreamTitle,
  setStreamDescription,
  setStreamVisibility,
  setStreamQuality,
  setCameraPermission,
  setMicrophonePermission,
  setIsRecording,
  addReaction,
  resetLivestreamState
} = livestreamSlice.actions;

// Selectors
export const selectCurrentStream = (state: RootState) => state.livestream.currentStream;
export const selectScheduledStreams = (state: RootState) => state.livestream.scheduledStreams;
export const selectPastStreams = (state: RootState) => state.livestream.pastStreams;
export const selectIsLivestreamLoading = (state: RootState) => state.livestream.isLoading;
export const selectLivestreamError = (state: RootState) => state.livestream.error;
export const selectStreamAnalytics = (state: RootState) => state.livestream.streamAnalytics;
export const selectIsPublishing = (state: RootState) => state.livestream.isPublishing;
export const selectPublishedProducts = (state: RootState) => state.livestream.publishedProducts;
export const selectIsRecording = (state: RootState) => state.livestream.isRecording;
export const selectCameraPermission = (state: RootState) => state.livestream.cameraPermission;
export const selectMicrophonePermission = (state: RootState) => state.livestream.microphonePermission;

// Select all stream products detected
export const selectDetectedProducts = (state: RootState) => {
  return state.livestream.currentStream?.detectedProducts || [];
};

// Select comments for current stream
export const selectStreamComments = (state: RootState) => {
  return state.livestream.currentStream?.comments || [];
};

// Is stream live currently?
export const selectIsStreamLive = (state: RootState) => {
  return state.livestream.currentStream?.status === StreamStatus.LIVE;
};

export default livestreamSlice.reducer;