/**
 * ResultsManagementService
 * 
 * Service for managing and organizing detection results from the livestream-to-catalog
 * process, including historical data, filtering, and reprocessing capabilities.
 */

import { DetectedProduct, ProcessingStats } from './ProductDetectionService';
import { ProductInformation } from './ProductInformationService';
import { CapturedFrame } from './LivestreamRecordingService';

// Represents a processing session
export interface ProcessingSession {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'processing' | 'completed' | 'failed' | 'archived';
  sourceType: 'livestream' | 'video' | 'images';
  sourceId?: string;
  duration: number; // Duration in seconds
  frameCount: number;
  stats: ProcessingStats;
  productsDetected: number;
  productsAdded: number;
  tags: string[];
  notes?: string;
}

// Represents a product detection result with its processing history
export interface DetectionResult {
  id: string;
  sessionId: string;
  detectedProduct: DetectedProduct;
  productInformation?: ProductInformation;
  status: 'detected' | 'processed' | 'added_to_catalog' | 'rejected' | 'pending_review';
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  addedToCatalogAt?: Date;
  catalogProductId?: string;
  rejectionReason?: string;
  manuallyEdited: boolean;
  processingHistory: {
    action: string;
    timestamp: Date;
    details?: any;
  }[];
  notes?: string;
  reviewTags?: string[];
}

// Filter options for results
export interface ResultsFilter {
  sessions?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: DetectionResult['status'][];
  minConfidence?: number;
  categories?: string[];
  addedToCatalog?: boolean;
  searchQuery?: string;
  tags?: string[];
  sortBy?: 'date' | 'confidence' | 'category' | 'status';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Represents performance metrics for processing
export interface ProcessingMetrics {
  totalSessions: number;
  totalFramesProcessed: number;
  totalProductsDetected: number;
  totalProductsAdded: number;
  averageDetectionRate: number; // Products per frame
  averageConfidence: number;
  processingTimeAverage: number; // ms per frame
  conversionRate: number; // % of detected products added to catalog
  categoryDistribution: {
    [category: string]: number;
  };
  performanceOverTime: {
    period: string;
    detectionCount: number;
    addedCount: number;
    averageConfidence: number;
  }[];
  topRejectionReasons: {
    reason: string;
    count: number;
  }[];
}

// Reprocessing options
export interface ReprocessingOptions {
  sessionId: string;
  frameIds?: string[];
  productIds?: string[];
  settings?: any; // Any specialized settings for reprocessing
  reason?: string;
}

class ResultsManagementService {
  private sessions: Map<string, ProcessingSession> = new Map();
  private results: Map<string, DetectionResult> = new Map();
  private sessionResults: Map<string, Set<string>> = new Map(); // Maps session ID to result IDs

  constructor() {
    // In a real implementation, this would load data from persistent storage
    this.loadInitialData();
  }

  /**
   * Load initial test data
   */
  private loadInitialData() {
    // This would typically load from database, for now we'll create some sample data
    // This is just for demonstration purposes
    const sampleSession: ProcessingSession = {
      id: 'session_1',
      name: 'Test Livestream Recording',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      status: 'completed',
      sourceType: 'livestream',
      duration: 300, // 5 minutes
      frameCount: 150,
      stats: {
        totalFrames: 150,
        processedFrames: 150,
        detectedProducts: 15,
        uniqueProducts: 8,
        totalProcessingTime: 30000,
        processingTimePerFrame: 200,
        averageConfidence: 0.82,
        frameProcessingRate: 5,
        detectionRate: 0.1
      },
      productsDetected: 15,
      productsAdded: 6,
      tags: ['clothing', 'test']
    };

    this.sessions.set(sampleSession.id, sampleSession);
    this.sessionResults.set(sampleSession.id, new Set());
  }

  /**
   * Create a new processing session
   */
  public createSession(
    name: string,
    sourceType: 'livestream' | 'video' | 'images',
    sourceId?: string
  ): ProcessingSession {
    const id = `session_${Date.now()}`;
    const session: ProcessingSession = {
      id,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'processing',
      sourceType,
      sourceId,
      duration: 0,
      frameCount: 0,
      stats: {
        totalFrames: 0,
        processedFrames: 0,
        detectedProducts: 0,
        uniqueProducts: 0,
        totalProcessingTime: 0,
        processingTimePerFrame: 0,
        averageConfidence: 0,
        frameProcessingRate: 0,
        detectionRate: 0
      },
      productsDetected: 0,
      productsAdded: 0,
      tags: []
    };

    this.sessions.set(id, session);
    this.sessionResults.set(id, new Set());
    
    return session;
  }

  /**
   * Update session with processing statistics
   */
  public updateSessionStats(
    sessionId: string,
    stats: ProcessingStats,
    frameCount: number,
    duration: number
  ): ProcessingSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    session.stats = stats;
    session.frameCount = frameCount;
    session.duration = duration;
    session.productsDetected = stats.detectedProducts;
    session.updatedAt = new Date();
    
    return session;
  }

  /**
   * Complete a processing session
   */
  public completeSession(sessionId: string): ProcessingSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    session.status = 'completed';
    session.updatedAt = new Date();
    
    return session;
  }

  /**
   * Add or update a detection result
   */
  public addDetectionResult(
    sessionId: string,
    detectedProduct: DetectedProduct,
    productInformation?: ProductInformation,
  ): DetectionResult | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    const resultId = `result_${Date.now()}_${detectedProduct.id}`;
    const now = new Date();
    
    const result: DetectionResult = {
      id: resultId,
      sessionId,
      detectedProduct,
      productInformation,
      status: productInformation ? 'processed' : 'detected',
      confidence: detectedProduct.confidence,
      createdAt: now,
      updatedAt: now,
      manuallyEdited: false,
      processingHistory: [
        {
          action: 'detection',
          timestamp: now,
          details: {
            frameId: detectedProduct.originalFrameId
          }
        }
      ]
    };
    
    if (productInformation) {
      result.processingHistory.push({
        action: 'information_extraction',
        timestamp: now
      });
    }
    
    this.results.set(resultId, result);
    this.sessionResults.get(sessionId)?.add(resultId);
    
    return result;
  }

  /**
   * Update the status of a detection result
   */
  public updateResultStatus(
    resultId: string,
    status: DetectionResult['status'],
    details?: any
  ): DetectionResult | null {
    const result = this.results.get(resultId);
    
    if (!result) {
      return null;
    }
    
    const now = new Date();
    result.status = status;
    result.updatedAt = now;
    
    // Add to processing history
    result.processingHistory.push({
      action: `status_change_to_${status}`,
      timestamp: now,
      details
    });
    
    // If added to catalog, update tracking
    if (status === 'added_to_catalog' && details?.catalogProductId) {
      result.addedToCatalogAt = now;
      result.catalogProductId = details.catalogProductId;
      
      // Update session count of added products
      const session = this.sessions.get(result.sessionId);
      if (session) {
        session.productsAdded += 1;
      }
    }
    
    // If rejected, add reason
    if (status === 'rejected' && details?.reason) {
      result.rejectionReason = details.reason;
    }
    
    return result;
  }

  /**
   * Add or update product information
   */
  public updateProductInformation(
    resultId: string,
    productInformation: ProductInformation,
    manuallyEdited: boolean = false
  ): DetectionResult | null {
    const result = this.results.get(resultId);
    
    if (!result) {
      return null;
    }
    
    const now = new Date();
    result.productInformation = productInformation;
    result.updatedAt = now;
    
    if (result.status === 'detected') {
      result.status = 'processed';
    }
    
    if (manuallyEdited) {
      result.manuallyEdited = true;
    }
    
    // Add to processing history
    result.processingHistory.push({
      action: manuallyEdited ? 'manual_information_update' : 'information_update',
      timestamp: now
    });
    
    return result;
  }

  /**
   * Add tags to a result for organization
   */
  public addReviewTags(
    resultId: string,
    tags: string[]
  ): DetectionResult | null {
    const result = this.results.get(resultId);
    
    if (!result) {
      return null;
    }
    
    // Initialize tags array if it doesn't exist
    if (!result.reviewTags) {
      result.reviewTags = [];
    }
    
    // Add new tags that don't already exist
    tags.forEach(tag => {
      if (!result.reviewTags!.includes(tag)) {
        result.reviewTags!.push(tag);
      }
    });
    
    result.updatedAt = new Date();
    
    return result;
  }

  /**
   * Add notes to a result
   */
  public addNotes(
    resultId: string,
    notes: string
  ): DetectionResult | null {
    const result = this.results.get(resultId);
    
    if (!result) {
      return null;
    }
    
    result.notes = notes;
    result.updatedAt = new Date();
    
    return result;
  }

  /**
   * Add tags to a session
   */
  public addSessionTags(
    sessionId: string,
    tags: string[]
  ): ProcessingSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Add new tags that don't already exist
    tags.forEach(tag => {
      if (!session.tags.includes(tag)) {
        session.tags.push(tag);
      }
    });
    
    session.updatedAt = new Date();
    
    return session;
  }

  /**
   * Add notes to a session
   */
  public addSessionNotes(
    sessionId: string,
    notes: string
  ): ProcessingSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    session.notes = notes;
    session.updatedAt = new Date();
    
    return session;
  }

  /**
   * Get all processing sessions
   */
  public getAllSessions(): ProcessingSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get a processing session by ID
   */
  public getSession(sessionId: string): ProcessingSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all results for a session
   */
  public getSessionResults(sessionId: string): DetectionResult[] {
    const resultIds = this.sessionResults.get(sessionId);
    
    if (!resultIds) {
      return [];
    }
    
    const results: DetectionResult[] = [];
    resultIds.forEach(id => {
      const result = this.results.get(id);
      if (result) {
        results.push(result);
      }
    });
    
    return results;
  }

  /**
   * Get a specific result by ID
   */
  public getResult(resultId: string): DetectionResult | null {
    return this.results.get(resultId) || null;
  }

  /**
   * Filter results based on criteria
   */
  public filterResults(filter: ResultsFilter): {
    results: DetectionResult[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    let filteredResults = this.getAllResults();
    
    // Filter by sessions
    if (filter.sessions && filter.sessions.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filter.sessions!.includes(result.sessionId)
      );
    }
    
    // Filter by date range
    if (filter.dateRange) {
      filteredResults = filteredResults.filter(result => 
        result.createdAt >= filter.dateRange!.start &&
        result.createdAt <= filter.dateRange!.end
      );
    }
    
    // Filter by status
    if (filter.status && filter.status.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filter.status!.includes(result.status)
      );
    }
    
    // Filter by minimum confidence
    if (filter.minConfidence !== undefined) {
      filteredResults = filteredResults.filter(result => 
        result.confidence >= filter.minConfidence!
      );
    }
    
    // Filter by categories
    if (filter.categories && filter.categories.length > 0) {
      filteredResults = filteredResults.filter(result => {
        const category = result.detectedProduct.attributes.category?.value;
        return category && filter.categories!.includes(category);
      });
    }
    
    // Filter by added to catalog
    if (filter.addedToCatalog !== undefined) {
      filteredResults = filteredResults.filter(result => 
        (result.status === 'added_to_catalog') === filter.addedToCatalog
      );
    }
    
    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filteredResults = filteredResults.filter(result => {
        if (!result.reviewTags) return false;
        return filter.tags!.some(tag => result.reviewTags!.includes(tag));
      });
    }
    
    // Filter by search query (search in product name, description, etc.)
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredResults = filteredResults.filter(result => {
        // Search in product name
        if (result.productInformation?.name.text.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in product description
        if (result.productInformation?.description.text.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in detected attributes
        const attributes = result.detectedProduct.attributes;
        for (const key in attributes) {
          if (attributes[key]?.value.toLowerCase().includes(query)) {
            return true;
          }
        }
        
        // Search in notes
        if (result.notes && result.notes.toLowerCase().includes(query)) {
          return true;
        }
        
        return false;
      });
    }
    
    // Sort results
    if (filter.sortBy) {
      filteredResults.sort((a, b) => {
        let comparison = 0;
        
        switch (filter.sortBy) {
          case 'date':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case 'confidence':
            comparison = a.confidence - b.confidence;
            break;
          case 'category':
            const categoryA = a.detectedProduct.attributes.category?.value || '';
            const categoryB = b.detectedProduct.attributes.category?.value || '';
            comparison = categoryA.localeCompare(categoryB);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
        }
        
        // Apply sort direction
        return filter.sortDirection === 'desc' ? -comparison : comparison;
      });
    }
    
    // Calculate pagination
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const total = filteredResults.length;
    const totalPages = Math.ceil(total / pageSize);
    
    // Apply pagination
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const paginatedResults = filteredResults.slice(start, end);
    
    return {
      results: paginatedResults,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Get all results
   */
  private getAllResults(): DetectionResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Calculate processing metrics
   */
  public calculateMetrics(dateRange?: { start: Date; end: Date }): ProcessingMetrics {
    const sessions = this.getAllSessions();
    const results = this.getAllResults();
    
    // Filter by date range if provided
    let filteredSessions = sessions;
    let filteredResults = results;
    
    if (dateRange) {
      filteredSessions = sessions.filter(session => 
        session.createdAt >= dateRange.start && session.createdAt <= dateRange.end
      );
      
      filteredResults = results.filter(result => 
        result.createdAt >= dateRange.start && result.createdAt <= dateRange.end
      );
    }
    
    // Calculate basic metrics
    const totalSessions = filteredSessions.length;
    const totalFramesProcessed = filteredSessions.reduce((sum, session) => sum + session.frameCount, 0);
    const totalProductsDetected = filteredSessions.reduce((sum, session) => sum + session.productsDetected, 0);
    const totalProductsAdded = filteredSessions.reduce((sum, session) => sum + session.productsAdded, 0);
    
    // Calculate average detection rate
    const averageDetectionRate = totalFramesProcessed > 0 
      ? totalProductsDetected / totalFramesProcessed 
      : 0;
    
    // Calculate average confidence
    const confidenceSum = filteredResults.reduce((sum, result) => sum + result.confidence, 0);
    const averageConfidence = filteredResults.length > 0 
      ? confidenceSum / filteredResults.length 
      : 0;
    
    // Calculate average processing time
    const processingTimeSum = filteredSessions.reduce((sum, session) => {
      return sum + (session.stats.processingTimePerFrame * session.stats.processedFrames);
    }, 0);
    const processingTimeAverage = totalFramesProcessed > 0 
      ? processingTimeSum / totalFramesProcessed 
      : 0;
    
    // Calculate conversion rate
    const conversionRate = totalProductsDetected > 0 
      ? (totalProductsAdded / totalProductsDetected) * 100 
      : 0;
    
    // Calculate category distribution
    const categoryDistribution: { [category: string]: number } = {};
    filteredResults.forEach(result => {
      const category = result.detectedProduct.attributes.category?.value || 'Unknown';
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });
    
    // Calculate top rejection reasons
    const rejectionReasons: { [reason: string]: number } = {};
    filteredResults
      .filter(result => result.status === 'rejected' && result.rejectionReason)
      .forEach(result => {
        const reason = result.rejectionReason || 'Unknown';
        rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
      });
    
    const topRejectionReasons = Object.entries(rejectionReasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate performance over time (by week)
    const performanceByWeek: { [week: string]: {
      detectionCount: number;
      addedCount: number;
      confidenceSum: number;
      resultCount: number;
    }} = {};
    
    filteredResults.forEach(result => {
      const date = result.createdAt;
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!performanceByWeek[weekKey]) {
        performanceByWeek[weekKey] = {
          detectionCount: 0,
          addedCount: 0,
          confidenceSum: 0,
          resultCount: 0
        };
      }
      
      performanceByWeek[weekKey].detectionCount++;
      performanceByWeek[weekKey].confidenceSum += result.confidence;
      performanceByWeek[weekKey].resultCount++;
      
      if (result.status === 'added_to_catalog') {
        performanceByWeek[weekKey].addedCount++;
      }
    });
    
    const performanceOverTime = Object.entries(performanceByWeek)
      .map(([period, data]) => ({
        period,
        detectionCount: data.detectionCount,
        addedCount: data.addedCount,
        averageConfidence: data.resultCount > 0 ? data.confidenceSum / data.resultCount : 0
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
    
    return {
      totalSessions,
      totalFramesProcessed,
      totalProductsDetected,
      totalProductsAdded,
      averageDetectionRate,
      averageConfidence,
      processingTimeAverage,
      conversionRate,
      categoryDistribution,
      performanceOverTime,
      topRejectionReasons
    };
  }

  /**
   * Archive a session
   */
  public archiveSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }
    
    session.status = 'archived';
    session.updatedAt = new Date();
    
    return true;
  }

  /**
   * Delete a session and all associated results
   */
  public deleteSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }
    
    // Delete all associated results
    const resultIds = this.sessionResults.get(sessionId);
    if (resultIds) {
      resultIds.forEach(id => {
        this.results.delete(id);
      });
      this.sessionResults.delete(sessionId);
    }
    
    // Delete the session
    this.sessions.delete(sessionId);
    
    return true;
  }

  /**
   * Prepare video reprocessing request
   */
  public prepareReprocessing(options: ReprocessingOptions): {
    sessionId: string;
    frameIds?: string[];
    productIds?: string[];
    settings?: any;
  } {
    // In a real implementation, this would prepare the data for reprocessing
    // For now, we'll just return the options as-is
    return {
      sessionId: options.sessionId,
      frameIds: options.frameIds,
      productIds: options.productIds,
      settings: options.settings
    };
  }

  /**
   * Export results to JSON
   */
  public exportResults(sessionId?: string): string {
    let exportData;
    
    if (sessionId) {
      // Export specific session and its results
      const session = this.sessions.get(sessionId);
      if (!session) {
        return JSON.stringify({ error: 'Session not found' });
      }
      
      const results = this.getSessionResults(sessionId);
      exportData = {
        session,
        results
      };
    } else {
      // Export all sessions and results
      exportData = {
        sessions: this.getAllSessions(),
        results: this.getAllResults()
      };
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import results from JSON
   */
  public importResults(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Import sessions
      if (data.sessions) {
        data.sessions.forEach((session: ProcessingSession) => {
          this.sessions.set(session.id, session);
          
          // Initialize session results set if it doesn't exist
          if (!this.sessionResults.has(session.id)) {
            this.sessionResults.set(session.id, new Set());
          }
        });
      } else if (data.session) {
        // Single session import
        this.sessions.set(data.session.id, data.session);
        
        // Initialize session results set if it doesn't exist
        if (!this.sessionResults.has(data.session.id)) {
          this.sessionResults.set(data.session.id, new Set());
        }
      }
      
      // Import results
      if (data.results) {
        data.results.forEach((result: DetectionResult) => {
          this.results.set(result.id, result);
          
          // Add to session results
          const sessionResults = this.sessionResults.get(result.sessionId);
          if (sessionResults) {
            sessionResults.add(result.id);
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error importing results:', error);
      return false;
    }
  }
}

export default new ResultsManagementService();