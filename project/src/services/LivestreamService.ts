import { Product } from '../store/slices/productsSlice';
import ProductRecognitionService from './ProductRecognitionService';

// Stream status types
export enum StreamStatus {
  OFFLINE = 'offline',
  CONNECTING = 'connecting',
  LIVE = 'live',
  ENDED = 'ended',
  ERROR = 'error',
  SCHEDULED = 'scheduled',
}

// Stream quality settings
export enum StreamQuality {
  LOW = 'low',     // 480p
  MEDIUM = 'medium', // 720p
  HIGH = 'high',   // 1080p
}

// Stream visibility options
export enum StreamVisibility {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private',
}

// Stream viewer type
export interface StreamViewer {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
}

// Stream comment type
export interface StreamComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  reactions?: {
    type: string;
    count: number;
  }[];
}

// Stream reaction type
export interface StreamReaction {
  type: string;
  count: number;
  timestamp: Date;
}

// Product detected in stream
export interface StreamDetectedProduct {
  timestamp: Date;
  productId: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  product?: Product;
  attributes?: {
    [key: string]: any;
  };
}

// Main stream session type
export interface StreamSession {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  scheduledFor?: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  status: StreamStatus;
  visibility: StreamVisibility;
  quality: StreamQuality;
  recordingUrl?: string;
  viewerCount: number;
  viewers: StreamViewer[];
  comments: StreamComment[];
  reactions: StreamReaction[];
  detectedProducts: StreamDetectedProduct[];
  publishedProducts: string[]; // IDs of products published during stream
  streamKey?: string;
  rtmpUrl?: string;
  playbackUrl?: string;
  liveUrl?: string;
  chatEnabled: boolean;
  productDetectionEnabled: boolean;
  productHighlightEnabled: boolean;
  analyticsEnabled: boolean;
  totalViews?: number;
  maxConcurrentViewers?: number;
  tags: string[];
}

// Stream session create params
export interface CreateStreamParams {
  title: string;
  description?: string;
  scheduledFor?: Date;
  visibility?: StreamVisibility;
  quality?: StreamQuality;
  chatEnabled?: boolean;
  productDetectionEnabled?: boolean;
  productHighlightEnabled?: boolean;
  analyticsEnabled?: boolean;
  tags?: string[];
}

// Stream analytics data
export interface StreamAnalytics {
  viewerCounts: {
    time: Date;
    count: number;
  }[];
  engagementMetrics: {
    comments: number;
    reactions: number;
    productClicks: number;
    shares: number;
  };
  viewerDemographics?: {
    locations: {
      region: string;
      count: number;
    }[];
    devices: {
      type: string;
      count: number;
    }[];
  };
  productPerformance: {
    productId: string;
    views: number;
    clicks: number;
    addedToCart: number;
    purchased: number;
  }[];
}

/**
 * Service for managing livestreaming functionality
 */
class LivestreamService {
  private activeSessions: Map<string, StreamSession> = new Map();
  private mockStreamInterval: any = null;
  private productRecognitionService: any;

  constructor() {
    this.productRecognitionService = ProductRecognitionService;
  }

  /**
   * Create a new stream session
   */
  createStreamSession(params: CreateStreamParams): StreamSession {
    const streamId = `stream_${Date.now()}`;
    const streamKey = `sk_${Math.random().toString(36).substring(2, 15)}`;
    const rtmpUrl = `rtmp://stream.autodukaan.io/live/${streamKey}`;
    const playbackUrl = `https://stream.autodukaan.io/live/${streamId}/index.m3u8`;
    const liveUrl = `https://autodukaan.io/live/${streamId}`;
    
    const newSession: StreamSession = {
      id: streamId,
      title: params.title,
      description: params.description || '',
      createdAt: new Date(),
      scheduledFor: params.scheduledFor,
      status: params.scheduledFor ? StreamStatus.SCHEDULED : StreamStatus.OFFLINE,
      visibility: params.visibility || StreamVisibility.PUBLIC,
      quality: params.quality || StreamQuality.MEDIUM,
      viewerCount: 0,
      viewers: [],
      comments: [],
      reactions: [],
      detectedProducts: [],
      publishedProducts: [],
      streamKey,
      rtmpUrl,
      playbackUrl,
      liveUrl,
      chatEnabled: params.chatEnabled !== false,
      productDetectionEnabled: params.productDetectionEnabled !== false,
      productHighlightEnabled: params.productHighlightEnabled !== false,
      analyticsEnabled: params.analyticsEnabled !== false,
      tags: params.tags || [],
    };
    
    this.activeSessions.set(streamId, newSession);
    return newSession;
  }
  
  /**
   * Get a stream session by ID
   */
  getStreamSession(streamId: string): StreamSession | undefined {
    return this.activeSessions.get(streamId);
  }
  
  /**
   * Get all active stream sessions
   */
  getAllStreamSessions(): StreamSession[] {
    return Array.from(this.activeSessions.values());
  }
  
  /**
   * Update stream session details
   */
  updateStreamSession(streamId: string, updates: Partial<StreamSession>): StreamSession | undefined {
    const session = this.activeSessions.get(streamId);
    if (!session) return undefined;
    
    const updatedSession = {
      ...session,
      ...updates,
    };
    
    this.activeSessions.set(streamId, updatedSession);
    return updatedSession;
  }
  
  /**
   * Start a streaming session
   */
  startStream(streamId: string): StreamSession | undefined {
    const session = this.activeSessions.get(streamId);
    if (!session) return undefined;
    
    const updatedSession: StreamSession = {
      ...session,
      status: StreamStatus.LIVE,
      startedAt: new Date(),
    };
    
    this.activeSessions.set(streamId, updatedSession);
    
    // For demo purposes, we'll simulate product detection
    if (updatedSession.productDetectionEnabled) {
      this.startMockProductDetection(streamId);
    }
    
    return updatedSession;
  }
  
  /**
   * End a streaming session
   */
  endStream(streamId: string): StreamSession | undefined {
    const session = this.activeSessions.get(streamId);
    if (!session) return undefined;
    
    const endedAt = new Date();
    const duration = session.startedAt 
      ? Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000)
      : 0;
    
    const updatedSession: StreamSession = {
      ...session,
      status: StreamStatus.ENDED,
      endedAt,
      duration,
      recordingUrl: `https://stream.autodukaan.io/recordings/${streamId}/index.m3u8`,
    };
    
    this.activeSessions.set(streamId, updatedSession);
    
    // Stop the mock detection
    if (this.mockStreamInterval) {
      clearInterval(this.mockStreamInterval);
      this.mockStreamInterval = null;
    }
    
    return updatedSession;
  }
  
  /**
   * Delete a stream session
   */
  deleteStreamSession(streamId: string): boolean {
    return this.activeSessions.delete(streamId);
  }
  
  /**
   * Add a viewer to a stream
   */
  addViewer(streamId: string, viewer: Omit<StreamViewer, 'joinedAt'>): StreamSession | undefined {
    const session = this.activeSessions.get(streamId);
    if (!session) return undefined;
    
    const newViewer: StreamViewer = {
      ...viewer,
      joinedAt: new Date()
    };
    
    const updatedViewers = [...session.viewers, newViewer];
    const updatedSession: StreamSession = {
      ...session,
      viewers: updatedViewers,
      viewerCount: updatedViewers.length
    };
    
    this.activeSessions.set(streamId, updatedSession);
    return updatedSession;
  }
  
  /**
   * Remove a viewer from a stream
   */
  removeViewer(streamId: string, viewerId: string): StreamSession | undefined {
    const session = this.activeSessions.get(streamId);
    if (!session) return undefined;
    
    const updatedViewers = session.viewers.filter(viewer => viewer.id !== viewerId);
    const updatedSession: StreamSession = {
      ...session,
      viewers: updatedViewers,
      viewerCount: updatedViewers.length
    };
    
    this.activeSessions.set(streamId, updatedSession);
    return updatedSession;
  }
  
  /**
   * Add a comment to a stream
   */
  addComment(
    streamId: string, 
    comment: Omit<StreamComment, 'id' | 'timestamp' | 'reactions'>
  ): StreamComment | undefined {
    const session = this.activeSessions.get(streamId);
    if (!session) return undefined;
    
    const newComment: StreamComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...comment,
      timestamp: new Date(),
      reactions: [],
    };
    
    const updatedComments = [...session.comments, newComment];
    const updatedSession: StreamSession = {
      ...session,
      comments: updatedComments,
    };
    
    this.activeSessions.set(streamId, updatedSession);
    return newComment;
  }
  
  /**
   * Add a reaction to a stream
   */
  addReaction(streamId: string, reactionType: string): StreamSession | undefined {
    const session = this.activeSessions.get(streamId);
    if (!session) return undefined;
    
    const existingReactionIndex = session.reactions.findIndex(r => r.type === reactionType);
    
    let updatedReactions = [...session.reactions];
    if (existingReactionIndex >= 0) {
      updatedReactions[existingReactionIndex] = {
        ...updatedReactions[existingReactionIndex],
        count: updatedReactions[existingReactionIndex].count + 1,
        timestamp: new Date(),
      };
    } else {
      updatedReactions.push({
        type: reactionType,
        count: 1,
        timestamp: new Date(),
      });
    }
    
    const updatedSession: StreamSession = {
      ...session,
      reactions: updatedReactions,
    };
    
    this.activeSessions.set(streamId, updatedSession);
    return updatedSession;
  }
  
  /**
   * Detect products in a stream frame
   */
  detectProducts(streamId: string, imageData: string): StreamDetectedProduct[] | undefined {
    const session = this.activeSessions.get(streamId);
    if (!session || !session.productDetectionEnabled) return undefined;
    
    // In a real implementation, this would send the image to the AI service
    // For demo purposes, we'll simulate the response
    
    // Simulate product detection with the recognition service
    const detectedProducts = this.simulateProductDetection(imageData);
    
    if (detectedProducts.length > 0) {
      const updatedDetectedProducts = [
        ...session.detectedProducts,
        ...detectedProducts,
      ];
      
      const updatedSession: StreamSession = {
        ...session,
        detectedProducts: updatedDetectedProducts,
      };
      
      this.activeSessions.set(streamId, updatedSession);
    }
    
    return detectedProducts;
  }
  
  /**
   * Publish a product to the catalog from a stream
   */
  publishProduct(streamId: string, productId: string): boolean {
    const session = this.activeSessions.get(streamId);
    if (!session) return false;
    
    // Check if product is already published
    if (session.publishedProducts.includes(productId)) {
      return true; // Already published
    }
    
    const updatedPublishedProducts = [...session.publishedProducts, productId];
    const updatedSession: StreamSession = {
      ...session,
      publishedProducts: updatedPublishedProducts,
    };
    
    this.activeSessions.set(streamId, updatedSession);
    return true;
  }
  
  /**
   * Get stream analytics
   */
  getStreamAnalytics(streamId: string): StreamAnalytics | undefined {
    const session = this.activeSessions.get(streamId);
    if (!session || !session.analyticsEnabled) return undefined;
    
    // In a real implementation, this would calculate analytics from the actual data
    // For demo purposes, we'll simulate the analytics
    
    const viewerCounts = [];
    if (session.startedAt) {
      const startTime = session.startedAt.getTime();
      const endTime = session.endedAt ? session.endedAt.getTime() : Date.now();
      const duration = endTime - startTime;
      
      // Generate sample viewer counts every 5 minutes
      const interval = 5 * 60 * 1000; // 5 minutes
      const maxViewers = session.maxConcurrentViewers || 50;
      
      for (let time = startTime; time <= endTime; time += interval) {
        // Simulate a realistic viewer curve
        const timeProgress = (time - startTime) / duration;
        let viewers = 0;
        
        if (timeProgress < 0.2) {
          // Ramp up
          viewers = Math.floor(maxViewers * (timeProgress / 0.2) * 0.8);
        } else if (timeProgress < 0.7) {
          // Peak
          viewers = Math.floor(maxViewers * (0.8 + Math.random() * 0.2));
        } else {
          // Decline
          viewers = Math.floor(maxViewers * 0.9 * (1 - ((timeProgress - 0.7) / 0.3)));
        }
        
        // Add some randomness
        viewers = Math.max(1, Math.floor(viewers * (0.9 + Math.random() * 0.2)));
        
        viewerCounts.push({
          time: new Date(time),
          count: viewers
        });
      }
    }
    
    const analytics: StreamAnalytics = {
      viewerCounts,
      engagementMetrics: {
        comments: session.comments.length,
        reactions: session.reactions.reduce((sum, reaction) => sum + reaction.count, 0),
        productClicks: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 20),
      },
      viewerDemographics: {
        locations: [
          { region: 'Delhi', count: Math.floor(Math.random() * 50) },
          { region: 'Mumbai', count: Math.floor(Math.random() * 40) },
          { region: 'Bangalore', count: Math.floor(Math.random() * 30) },
          { region: 'Hyderabad', count: Math.floor(Math.random() * 20) },
          { region: 'Chennai', count: Math.floor(Math.random() * 15) },
        ],
        devices: [
          { type: 'Mobile', count: Math.floor(Math.random() * 100) + 50 },
          { type: 'Desktop', count: Math.floor(Math.random() * 30) + 10 },
          { type: 'Tablet', count: Math.floor(Math.random() * 10) + 5 },
        ],
      },
      productPerformance: session.publishedProducts.map(productId => ({
        productId,
        views: Math.floor(Math.random() * 200),
        clicks: Math.floor(Math.random() * 100),
        addedToCart: Math.floor(Math.random() * 50),
        purchased: Math.floor(Math.random() * 20),
      })),
    };
    
    return analytics;
  }
  
  /**
   * Get all scheduled streams
   */
  getScheduledStreams(): StreamSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.status === StreamStatus.SCHEDULED)
      .sort((a, b) => {
        if (!a.scheduledFor || !b.scheduledFor) return 0;
        return a.scheduledFor.getTime() - b.scheduledFor.getTime();
      });
  }
  
  /**
   * Schedule a stream for a future date
   */
  scheduleStream(params: CreateStreamParams & { scheduledFor: Date }): StreamSession {
    return this.createStreamSession({
      ...params,
      scheduledFor: params.scheduledFor,
    });
  }
  
  /**
   * Start periodic product detection (mock implementation)
   */
  private startMockProductDetection(streamId: string) {
    // In a real app, this would be done by actually analyzing video frames
    // For demo purposes, we'll simulate periodic product detection
    
    if (this.mockStreamInterval) {
      clearInterval(this.mockStreamInterval);
    }
    
    this.mockStreamInterval = setInterval(() => {
      const mockImageData = `data:image/jpeg;base64,${Math.random().toString(36).substring(2, 15)}`;
      this.detectProducts(streamId, mockImageData);
    }, 10000); // Detect products every 10 seconds
  }
  
  /**
   * Simulate product detection (mock implementation)
   */
  private simulateProductDetection(imageData: string): StreamDetectedProduct[] {
    // In a real implementation, this would use computer vision to identify products
    // For demo purposes, we'll simulate the detection
    
    // Simulate detection by random chance
    if (Math.random() > 0.7) {
      // No products detected
      return [];
    }
    
    // Generate 1-3 random "detected" products
    const numProducts = Math.floor(Math.random() * 3) + 1;
    const detectedProducts: StreamDetectedProduct[] = [];
    
    for (let i = 0; i < numProducts; i++) {
      const productId = `product_${Math.floor(Math.random() * 1000)}`;
      
      const detectedProduct: StreamDetectedProduct = {
        timestamp: new Date(),
        productId,
        confidence: 0.7 + Math.random() * 0.3, // 70-100% confidence
        boundingBox: {
          x: Math.random() * 0.7, // 0-70% from left
          y: Math.random() * 0.7, // 0-70% from top
          width: 0.1 + Math.random() * 0.3, // 10-40% of width
          height: 0.1 + Math.random() * 0.3, // 10-40% of height
        },
        attributes: {
          color: ['red', 'blue', 'green', 'black', 'white'][Math.floor(Math.random() * 5)],
          type: ['shirt', 'pants', 'dress', 'jacket', 'skirt'][Math.floor(Math.random() * 5)],
          pattern: ['solid', 'striped', 'floral', 'checkered'][Math.floor(Math.random() * 4)],
        },
      };
      
      detectedProducts.push(detectedProduct);
    }
    
    return detectedProducts;
  }
}

export default new LivestreamService();