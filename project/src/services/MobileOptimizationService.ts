import { 
  isMobileDevice, 
  hasSlowConnection,
  getBatteryLevel,
  getOptimalImageQuality,
  getOptimalCaptureInterval,
  getOptimalVideoConstraints,
  getOptimalFrameRate,
  debounce,
  throttle
} from '../utils/mobileOptimization';

/**
 * Service to manage mobile-specific optimizations for the livestream-to-catalog feature
 */
class MobileOptimizationService {
  private batteryLevel: number | null = null;
  private isLowBattery = false;
  private batteryThreshold = 15;
  private isMobile = false;
  private isSlowConnection = false;
  
  constructor() {
    this.init();
  }
  
  /**
   * Initialize the service
   */
  private async init() {
    this.isMobile = isMobileDevice();
    this.isSlowConnection = hasSlowConnection();
    
    // Monitor battery if available
    this.batteryLevel = await getBatteryLevel();
    this.isLowBattery = this.batteryLevel !== null && this.batteryLevel <= this.batteryThreshold;
    
    // Set up battery monitoring
    this.setupBatteryMonitoring();
    
    // Set up connection monitoring
    this.setupConnectionMonitoring();
  }
  
  /**
   * Set up battery level monitoring
   */
  private setupBatteryMonitoring() {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery?.().then(battery => {
        // Update initial battery level
        this.batteryLevel = Math.round(battery.level * 100);
        this.isLowBattery = this.batteryLevel <= this.batteryThreshold;
        
        // Listen for battery level changes
        battery.addEventListener('levelchange', () => {
          this.batteryLevel = Math.round(battery.level * 100);
          this.isLowBattery = this.batteryLevel <= this.batteryThreshold;
        });
      });
    }
  }
  
  /**
   * Set up connection monitoring
   */
  private setupConnectionMonitoring() {
    if ('connection' in navigator) {
      // @ts-ignore - Connection API not fully in TypeScript types
      const connection = navigator.connection;
      
      if (connection) {
        // Update when connection changes
        connection.addEventListener('change', () => {
          this.isSlowConnection = hasSlowConnection();
        });
      }
    }
  }
  
  /**
   * Get the current optimization profile based on device conditions
   * @returns Object containing optimization parameters
   */
  public async getOptimizationProfile() {
    return {
      imageQuality: await getOptimalImageQuality(),
      captureInterval: await getOptimalCaptureInterval(),
      videoConstraints: await getOptimalVideoConstraints(),
      frameRate: getOptimalFrameRate(),
      isMobile: this.isMobile,
      isSlowConnection: this.isSlowConnection,
      batteryLevel: this.batteryLevel,
      isLowBattery: this.isLowBattery
    };
  }
  
  /**
   * Creates a throttled function for high-impact operations
   * @param fn Function to throttle
   * @param defaultLimit Default time limit in milliseconds
   * @returns Throttled function
   */
  public createThrottledFunction<F extends (...args: any[]) => any>(
    fn: F, 
    defaultLimit = 200
  ): ((...args: Parameters<F>) => void) {
    // Adjust throttle limit based on device
    let limit = defaultLimit;
    
    if (this.isMobile) {
      limit *= 1.5; // 300ms for mobile
    }
    
    if (this.isSlowConnection) {
      limit *= 2; // 600ms for slow connections
    }
    
    if (this.isLowBattery) {
      limit *= 1.5; // 900ms for low battery
    }
    
    return throttle(fn, limit);
  }
  
  /**
   * Creates a debounced function for events that might fire rapidly
   * @param fn Function to debounce
   * @param defaultDelay Default delay in milliseconds
   * @returns Debounced function
   */
  public createDebouncedFunction<F extends (...args: any[]) => any>(
    fn: F, 
    defaultDelay = 300
  ): ((...args: Parameters<F>) => void) {
    // Adjust debounce delay based on device
    let delay = defaultDelay;
    
    if (this.isMobile) {
      delay *= 1.5; // 450ms for mobile
    }
    
    if (this.isSlowConnection) {
      delay *= 1.5; // 675ms for slow connections
    }
    
    return debounce(fn, delay);
  }
  
  /**
   * Optimize images for mobile devices
   * @param imageData Image data URL
   * @param targetWidth Target width in pixels
   * @returns Promise with optimized image data URL
   */
  public async optimizeImage(imageData: string, targetWidth = 640): Promise<string> {
    return new Promise((resolve) => {
      const quality = this.isLowBattery ? 0.5 : 
                     this.isSlowConnection ? 0.6 : 
                     this.isMobile ? 0.7 : 0.9;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(imageData); // Return original if canvas not supported
          return;
        }
        
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        const newWidth = Math.min(img.width, targetWidth);
        const newHeight = newWidth / aspectRatio;
        
        // Resize image
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to data URL with reduced quality
        const optimizedData = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedData);
      };
      
      img.src = imageData;
    });
  }
  
  /**
   * Check if hardware acceleration should be used
   * @returns boolean
   */
  public shouldUseHardwareAcceleration(): boolean {
    return !this.isLowBattery;
  }
  
  /**
   * Check if high-quality processing should be used
   * @returns boolean
   */
  public shouldUseHighQualityProcessing(): boolean {
    return !this.isMobile || (!this.isLowBattery && !this.isSlowConnection);
  }
  
  /**
   * Get recommended maximum number of concurrent processing tasks
   * @returns number
   */
  public getRecommendedConcurrentTasks(): number {
    if (this.isLowBattery) return 1;
    if (this.isMobile) return 2;
    if (this.isSlowConnection) return 2;
    return 4;
  }
}

export default new MobileOptimizationService();