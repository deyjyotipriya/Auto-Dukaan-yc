/**
 * LivestreamRecordingService
 * 
 * A lightweight background recording service that captures screenshots
 * from ongoing livestreams at configurable intervals with minimal resource usage.
 */

// Frame capture settings
export interface CaptureSettings {
  captureInterval: number; // Time between captures in milliseconds
  maxFrames: number;      // Maximum number of frames to store
  quality: number;        // JPEG quality (0-1)
  resolution: {           // Resolution to capture frames at
    width: number;
    height: number;
  };
  batteryThreshold: number; // Minimum battery percentage to continue capturing
  detectInactivity: boolean; // Whether to auto-pause when no movement detected
}

// Captured frame data
export interface CapturedFrame {
  id: string;
  timestamp: Date;
  dataUrl: string;       // Base64 encoded image data
  sourceWidth: number;   // Original source width
  sourceHeight: number;  // Original source height
  batteryLevel?: number; // Battery level at time of capture
  detectedProducts?: {   // Products detected in this frame (if any)
    id: string;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    confidence: number;
  }[];
}

// Recording session data
export interface RecordingSession {
  id: string;
  source: 'screen' | 'camera' | 'upload';
  sourceId?: string;     // Device ID or URL
  startTime: Date;
  endTime?: Date;
  settings: CaptureSettings;
  frames: CapturedFrame[];
  status: 'recording' | 'paused' | 'completed' | 'error';
  error?: string;
  batteryWarningIssued: boolean;
  totalStorageUsed: number; // In bytes
  sourceVideoUrl?: string;  // For uploaded videos
  productCategories?: string[]; // Categories to assist detection
  processingProgress?: number; // 0-100 percentage
}

class LivestreamRecordingService {
  private activeSessions: Map<string, RecordingSession> = new Map();
  private captureIntervals: Map<string, number> = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private defaultSettings: CaptureSettings = {
    captureInterval: 5000, // 5 seconds between captures
    maxFrames: 1000,
    quality: 0.7,
    resolution: {
      width: 640,
      height: 480
    },
    batteryThreshold: 15, // Pause when battery below 15%
    detectInactivity: true
  };

  constructor() {
    // Create a canvas for processing frames
    this.initializeCanvas();
    
    // Set up battery monitoring
    this.setupBatteryMonitoring();
  }

  /**
   * Initialize canvas for frame processing
   */
  private initializeCanvas() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  /**
   * Set up battery monitoring to pause recording when battery is low
   */
  private async setupBatteryMonitoring() {
    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        // @ts-ignore - Battery API not in all TypeScript types
        const battery = await navigator.getBattery();
        
        battery.addEventListener('levelchange', () => {
          this.handleBatteryChange(battery.level * 100);
        });
        
        // Initial check
        this.handleBatteryChange(battery.level * 100);
      }
    } catch (error) {
      console.log('Battery API not supported or permission denied');
    }
  }

  /**
   * Handle battery level changes
   */
  private handleBatteryChange(batteryLevel: number) {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      // Only check sessions that are currently recording
      if (session.status === 'recording') {
        if (batteryLevel < session.settings.batteryThreshold) {
          if (!session.batteryWarningIssued) {
            this.pauseRecording(sessionId, `Battery level low (${batteryLevel}%)`);
            session.batteryWarningIssued = true;
          }
        } else if (session.batteryWarningIssued) {
          // Battery is now above threshold, allow resuming
          session.batteryWarningIssued = false;
        }
      }
    }
  }

  /**
   * Start a new screen recording session
   */
  public async startScreenRecording(settings?: Partial<CaptureSettings>): Promise<RecordingSession | null> {
    try {
      if (!this.canvas || !this.ctx) {
        throw new Error('Canvas not initialized');
      }
      
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });
      
      // Create session with combined settings
      const sessionSettings: CaptureSettings = {
        ...this.defaultSettings,
        ...settings
      };
      
      const sessionId = `recording_${Date.now()}`;
      const session: RecordingSession = {
        id: sessionId,
        source: 'screen',
        sourceId: stream.id,
        startTime: new Date(),
        settings: sessionSettings,
        frames: [],
        status: 'recording',
        batteryWarningIssued: false,
        totalStorageUsed: 0
      };
      
      this.activeSessions.set(sessionId, session);
      
      // Start capturing frames
      this.startFrameCapture(sessionId, stream);
      
      // Set up stream ended event
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopRecording(sessionId);
      });
      
      return session;
    } catch (error) {
      console.error('Failed to start screen recording:', error);
      return null;
    }
  }

  /**
   * Start a new camera recording session
   */
  public async startCameraRecording(settings?: Partial<CaptureSettings>): Promise<RecordingSession | null> {
    try {
      if (!this.canvas || !this.ctx) {
        throw new Error('Canvas not initialized');
      }
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      // Create session with combined settings
      const sessionSettings: CaptureSettings = {
        ...this.defaultSettings,
        ...settings
      };
      
      const sessionId = `recording_${Date.now()}`;
      const session: RecordingSession = {
        id: sessionId,
        source: 'camera',
        sourceId: stream.id,
        startTime: new Date(),
        settings: sessionSettings,
        frames: [],
        status: 'recording',
        batteryWarningIssued: false,
        totalStorageUsed: 0
      };
      
      this.activeSessions.set(sessionId, session);
      
      // Start capturing frames
      this.startFrameCapture(sessionId, stream);
      
      // Set up stream ended event
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopRecording(sessionId);
      });
      
      return session;
    } catch (error) {
      console.error('Failed to start camera recording:', error);
      return null;
    }
  }

  /**
   * Create a recording session from an uploaded video
   */
  public async createFromUploadedVideo(
    videoFile: File,
    settings?: Partial<CaptureSettings>,
    productCategories?: string[]
  ): Promise<RecordingSession | null> {
    try {
      if (!this.canvas || !this.ctx) {
        throw new Error('Canvas not initialized');
      }
      
      // Create a URL for the video file
      const videoUrl = URL.createObjectURL(videoFile);
      
      // Create session with combined settings
      const sessionSettings: CaptureSettings = {
        ...this.defaultSettings,
        ...settings
      };
      
      const sessionId = `recording_${Date.now()}`;
      const session: RecordingSession = {
        id: sessionId,
        source: 'upload',
        startTime: new Date(),
        settings: sessionSettings,
        frames: [],
        status: 'paused', // Start in paused status until processing begins
        batteryWarningIssued: false,
        totalStorageUsed: 0,
        sourceVideoUrl: videoUrl,
        productCategories,
        processingProgress: 0
      };
      
      this.activeSessions.set(sessionId, session);
      
      return session;
    } catch (error) {
      console.error('Failed to create session from uploaded video:', error);
      return null;
    }
  }

  /**
   * Process an uploaded video to extract frames
   */
  public async processVideoFile(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.sourceVideoUrl) {
      console.error('Session not found or no source video URL');
      return false;
    }
    
    try {
      // Update session status
      session.status = 'recording';
      
      // Create a video element to process the file
      const video = document.createElement('video');
      video.src = session.sourceVideoUrl;
      video.muted = true;
      
      // Wait for video metadata to load
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
        video.load();
      });
      
      // Set canvas dimensions based on video
      if (this.canvas) {
        this.canvas.width = session.settings.resolution.width;
        this.canvas.height = session.settings.resolution.height;
      }
      
      // Get video duration and calculate frames to capture
      const duration = video.duration;
      const framesCount = Math.min(
        Math.floor(duration * 1000 / session.settings.captureInterval),
        session.settings.maxFrames
      );
      
      // Start playing the video
      video.play();
      
      // Process frames at regular intervals
      for (let i = 0; i < framesCount; i++) {
        // Check if session was stopped or paused
        if (session.status !== 'recording') {
          break;
        }
        
        // Calculate time position
        const timePosition = (i * session.settings.captureInterval) / 1000;
        
        // Skip to the specific time
        video.currentTime = timePosition;
        
        // Wait for the video to seek to the time
        await new Promise<void>((resolve) => {
          const seeked = () => {
            video.removeEventListener('seeked', seeked);
            resolve();
          };
          video.addEventListener('seeked', seeked);
        });
        
        // Capture the frame
        this.captureVideoFrame(sessionId, video);
        
        // Update progress
        session.processingProgress = Math.round((i / framesCount) * 100);
      }
      
      // Complete the session
      session.status = 'completed';
      session.endTime = new Date();
      session.processingProgress = 100;
      
      // Clean up
      video.pause();
      video.src = '';
      
      return true;
    } catch (error) {
      console.error('Error processing video file:', error);
      session.status = 'error';
      session.error = (error as Error).message;
      return false;
    }
  }

  /**
   * Start capturing frames from a media stream
   */
  private startFrameCapture(sessionId: string, stream: MediaStream) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    // Create a video element to display the stream
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.play();
    
    // Wait for video to start playing
    video.onplaying = () => {
      if (!this.canvas || !this.ctx) return;
      
      // Set canvas dimensions
      this.canvas.width = session.settings.resolution.width;
      this.canvas.height = session.settings.resolution.height;
      
      // Start interval to capture frames
      const intervalId = window.setInterval(() => {
        // Only capture if session is in recording state
        if (session.status === 'recording') {
          this.captureVideoFrame(sessionId, video);
        }
        
        // Check if we've reached the maximum number of frames
        if (session.frames.length >= session.settings.maxFrames) {
          this.pauseRecording(sessionId, 'Maximum frames reached');
        }
      }, session.settings.captureInterval);
      
      this.captureIntervals.set(sessionId, intervalId);
    };
  }

  /**
   * Capture a single frame from video element
   */
  private captureVideoFrame(sessionId: string, video: HTMLVideoElement) {
    const session = this.activeSessions.get(sessionId);
    if (!session || !this.canvas || !this.ctx) return;
    
    // Draw the current video frame to the canvas
    this.ctx.drawImage(
      video, 
      0, 0, 
      this.canvas.width, 
      this.canvas.height
    );
    
    // Convert canvas to jpeg data URL with quality setting
    const dataUrl = this.canvas.toDataURL('image/jpeg', session.settings.quality);
    
    // Get approximate size of the data URL in bytes
    const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
    
    // Create frame object
    const frame: CapturedFrame = {
      id: `frame_${Date.now()}_${session.frames.length}`,
      timestamp: new Date(),
      dataUrl,
      sourceWidth: video.videoWidth,
      sourceHeight: video.videoHeight
    };
    
    // Add battery level if available
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      // @ts-ignore - Battery API not in all TypeScript types
      navigator.getBattery().then((battery) => {
        frame.batteryLevel = battery.level * 100;
      });
    }
    
    // Add frame to session
    session.frames.push(frame);
    session.totalStorageUsed += sizeInBytes;
    
    // Dispatch event for UI to update
    this.dispatchFrameCapturedEvent(sessionId, frame);
  }

  /**
   * Dispatch custom event when a frame is captured
   */
  private dispatchFrameCapturedEvent(sessionId: string, frame: CapturedFrame) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('frameCaptured', {
        detail: { sessionId, frame }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Pause a recording session
   */
  public pauseRecording(sessionId: string, reason?: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    session.status = 'paused';
    console.log(`Recording paused: ${reason || 'User requested'}`);
    
    return true;
  }

  /**
   * Resume a paused recording session
   */
  public resumeRecording(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    // Only resume if not at low battery
    if (session.batteryWarningIssued) {
      console.log('Cannot resume: battery level too low');
      return false;
    }
    
    session.status = 'recording';
    return true;
  }

  /**
   * Stop a recording session
   */
  public stopRecording(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    // Clear the capture interval if it exists
    const intervalId = this.captureIntervals.get(sessionId);
    if (intervalId) {
      clearInterval(intervalId);
      this.captureIntervals.delete(sessionId);
    }
    
    // Update session state
    session.status = 'completed';
    session.endTime = new Date();
    
    return true;
  }

  /**
   * Get a recording session by ID
   */
  public getSession(sessionId: string): RecordingSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all recording sessions
   */
  public getAllSessions(): RecordingSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Delete a recording session
   */
  public deleteSession(sessionId: string): boolean {
    // Stop recording if active
    this.stopRecording(sessionId);
    
    // Remove session
    return this.activeSessions.delete(sessionId);
  }

  /**
   * Export frames from a session
   */
  public exportSessionFrames(sessionId: string): CapturedFrame[] {
    const session = this.activeSessions.get(sessionId);
    if (!session) return [];
    
    return [...session.frames];
  }

  /**
   * Save session data to local storage
   */
  public saveSessionToLocalStorage(sessionId: string): boolean {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;
      
      // Store session metadata without frames to save space
      const sessionMeta = { ...session, frames: [] };
      localStorage.setItem(`recordingSession_${sessionId}_meta`, JSON.stringify(sessionMeta));
      
      // Store frames in chunks to avoid localStorage size limits
      const chunkSize = 10;
      const frameChunks = this.chunkArray(session.frames, chunkSize);
      
      frameChunks.forEach((chunk, index) => {
        localStorage.setItem(
          `recordingSession_${sessionId}_frames_${index}`,
          JSON.stringify(chunk)
        );
      });
      
      localStorage.setItem(
        `recordingSession_${sessionId}_frameCount`,
        String(frameChunks.length)
      );
      
      return true;
    } catch (error) {
      console.error('Failed to save session to localStorage:', error);
      return false;
    }
  }

  /**
   * Load session data from local storage
   */
  public loadSessionFromLocalStorage(sessionId: string): RecordingSession | null {
    try {
      // Load session metadata
      const sessionMetaStr = localStorage.getItem(`recordingSession_${sessionId}_meta`);
      if (!sessionMetaStr) return null;
      
      const sessionMeta = JSON.parse(sessionMetaStr) as RecordingSession;
      
      // Load frame count
      const frameCountStr = localStorage.getItem(`recordingSession_${sessionId}_frameCount`);
      if (!frameCountStr) return sessionMeta;
      
      const frameCount = parseInt(frameCountStr, 10);
      
      // Load frames
      let frames: CapturedFrame[] = [];
      for (let i = 0; i < frameCount; i++) {
        const chunkStr = localStorage.getItem(`recordingSession_${sessionId}_frames_${i}`);
        if (chunkStr) {
          const chunk = JSON.parse(chunkStr) as CapturedFrame[];
          frames = [...frames, ...chunk];
        }
      }
      
      // Combine metadata with frames
      const session: RecordingSession = {
        ...sessionMeta,
        frames
      };
      
      // Add to active sessions map
      this.activeSessions.set(sessionId, session);
      
      return session;
    } catch (error) {
      console.error('Failed to load session from localStorage:', error);
      return null;
    }
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Adjust capture settings for a session
   */
  public adjustCaptureSettings(
    sessionId: string, 
    settings: Partial<CaptureSettings>
  ): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    // Update settings
    session.settings = {
      ...session.settings,
      ...settings
    };
    
    // If the interval changed and we're recording, restart the interval
    if (
      settings.captureInterval && 
      session.status === 'recording' && 
      this.captureIntervals.has(sessionId)
    ) {
      const oldIntervalId = this.captureIntervals.get(sessionId);
      if (oldIntervalId) clearInterval(oldIntervalId);
      
      // Restart interval with new timing
      const video = document.querySelector(`video[data-session-id="${sessionId}"]`) as HTMLVideoElement;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        this.startFrameCapture(sessionId, stream);
      }
    }
    
    return true;
  }

  /**
   * Get estimated storage usage for a session
   */
  public getEstimatedStorage(sessionId: string): number {
    const session = this.activeSessions.get(sessionId);
    if (!session) return 0;
    
    return session.totalStorageUsed;
  }
}

export default new LivestreamRecordingService();