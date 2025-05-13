/**
 * Utility functions for mobile device optimizations
 */

/**
 * Determines if the current device is likely a mobile device
 * @returns boolean true if device is mobile
 */
export const isMobileDevice = (): boolean => {
  return window.innerWidth < 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Determines if the device has a slow connection
 * @returns boolean true if connection is slow
 */
export const hasSlowConnection = (): boolean => {
  if ('connection' in navigator) {
    // @ts-ignore - Connection API not fully in TypeScript types
    const connection = navigator.connection;
    
    if (connection) {
      // Check if connection is slow based on effectiveType or downlink
      if (connection.effectiveType && ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) {
        return true;
      }
      
      // If downlink is available, consider under 1 Mbps as slow
      if (connection.downlink !== undefined && connection.downlink < 1) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Gets the device battery level if available
 * @returns Promise<number|null> battery percentage or null if not available
 */
export const getBatteryLevel = async (): Promise<number | null> => {
  try {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      // @ts-ignore - Battery API not in all TypeScript types
      const battery = await navigator.getBattery();
      return Math.round(battery.level * 100);
    }
  } catch (error) {
    console.log('Battery API not supported');
  }
  
  return null;
};

/**
 * Optimizes image quality based on device capabilities and connection speed
 * @returns number between 0.1 and 1.0
 */
export const getOptimalImageQuality = async (): Promise<number> => {
  // Start with default quality
  let quality = 0.8;
  
  // Decrease quality for mobile devices
  if (isMobileDevice()) {
    quality = 0.7;
  }
  
  // Further decrease quality for slow connections
  if (hasSlowConnection()) {
    quality = 0.5;
  }
  
  // Reduce quality when battery is low to save power
  const batteryLevel = await getBatteryLevel();
  if (batteryLevel !== null && batteryLevel < 20) {
    quality = Math.max(quality - 0.2, 0.3);
  }
  
  return quality;
};

/**
 * Determines optimal capture interval based on device capabilities
 * @returns number in milliseconds
 */
export const getOptimalCaptureInterval = async (): Promise<number> => {
  // Default capture interval (5 seconds)
  let interval = 5000;
  
  // Increase interval for mobile to save battery
  if (isMobileDevice()) {
    interval = 7000;
  }
  
  // Further increase interval for slow connections
  if (hasSlowConnection()) {
    interval = 10000;
  }
  
  // Increase interval when battery is low
  const batteryLevel = await getBatteryLevel();
  if (batteryLevel !== null && batteryLevel < 15) {
    interval = 15000;
  }
  
  return interval;
};

/**
 * Gets optimal video constraints for mobile devices
 * @returns MediaTrackConstraints
 */
export const getOptimalVideoConstraints = async (): Promise<MediaTrackConstraints> => {
  // Default constraints
  const constraints: MediaTrackConstraints = {
    facingMode: { ideal: 'environment' } // Prefer back camera on mobile
  };
  
  // Adjust quality based on device and network
  if (isMobileDevice()) {
    if (hasSlowConnection()) {
      // Low resolution for slow connections
      constraints.width = { ideal: 640 };
      constraints.height = { ideal: 480 };
    } else {
      // Medium resolution for normal mobile connections
      constraints.width = { ideal: 1280 };
      constraints.height = { ideal: 720 };
    }
  } else {
    // Higher resolution for desktop with good connection
    if (!hasSlowConnection()) {
      constraints.width = { ideal: 1920 };
      constraints.height = { ideal: 1080 };
    }
  }
  
  return constraints;
};

/**
 * Optimizes the frame rate based on device capabilities
 * @returns number frames per second
 */
export const getOptimalFrameRate = (): number => {
  // Default frame rate
  let frameRate = 30;
  
  // Lower frame rate for mobile
  if (isMobileDevice()) {
    frameRate = 24;
  }
  
  // Further lower for slow connections
  if (hasSlowConnection()) {
    frameRate = 15;
  }
  
  return frameRate;
};

/**
 * Debounce function to reduce performance impact of frequent events
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <F extends (...args: any[]) => any>(fn: F, delay: number): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<F>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * Throttle function to limit the rate at which a function can fire
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <F extends (...args: any[]) => any>(fn: F, limit: number): ((...args: Parameters<F>) => void) => {
  let inThrottle = false;
  
  return function(...args: Parameters<F>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};