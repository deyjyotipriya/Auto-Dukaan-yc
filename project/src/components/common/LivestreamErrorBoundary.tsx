import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface LivestreamErrorBoundaryProps {
  children: React.ReactNode;
  onRestart?: () => void;
  fallbackComponent?: React.ReactNode;
}

/**
 * Specialized Error Boundary for Livestream components
 * 
 * Handles media-related errors including:
 * - Camera access issues
 * - Media stream errors
 * - Recording failures
 * - Browser compatibility issues
 */
const LivestreamErrorBoundary: React.FC<LivestreamErrorBoundaryProps> = ({
  children,
  onRestart,
  fallbackComponent
}) => {
  const [hasPermissionErrors, setHasPermissionErrors] = React.useState(false);
  
  const handleMediaError = (error: Error) => {
    console.error('Livestream media error:', error);
    
    // Check if this is a permission error
    if (
      error.message.includes('permission') ||
      error.message.includes('denied') ||
      error.message.includes('NotAllowedError')
    ) {
      setHasPermissionErrors(true);
    }
    
    // Try to clean up any lingering media streams
    try {
      const cleanup = () => {
        // Find any active media streams and stop them
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            if (stream.getTracks) {
              stream.getTracks().forEach(track => track.stop());
            }
            video.srcObject = null;
          }
        });
      };
      
      cleanup();
    } catch (cleanupError) {
      console.warn('Failed to clean up media streams:', cleanupError);
    }
  };
  
  const renderFallback = (error: Error, resetError: () => void) => {
    // Use custom fallback if provided
    if (fallbackComponent) {
      return fallbackComponent;
    }
    
    // Categorize common livestream errors
    const isPermissionError = 
      error.message.includes('permission') || 
      error.message.includes('denied') ||
      error.message.includes('NotAllowedError');
    
    const isNotFoundError = 
      error.message.includes('NotFoundError') || 
      error.message.includes('no camera') ||
      error.message.includes('device not found');
    
    const isSecurityError = 
      error.message.includes('secure context') || 
      error.message.includes('https') ||
      error.message.includes('security');
      
    const isCompatibilityError = 
      error.message.includes('not supported') || 
      error.message.includes('getUserMedia') ||
      error.message.includes('not implemented');
    
    const handleRestart = () => {
      if (onRestart) {
        onRestart();
      }
      resetError();
    };
    
    return (
      <div className="livestream-error-boundary">
        <h3>Camera/Livestream Error</h3>
        
        {isPermissionError && (
          <div>
            <p>Camera permission denied. Please allow camera access to use livestream features.</p>
            <div className="permission-instructions">
              <p>To fix this issue:</p>
              <ol>
                <li>Click the camera icon in your browser's address bar</li>
                <li>Select "Always allow" for camera access on this site</li>
                <li>Refresh the page</li>
              </ol>
            </div>
          </div>
        )}
        
        {isNotFoundError && (
          <p>No camera detected. Please connect a webcam and try again.</p>
        )}
        
        {isSecurityError && (
          <p>Livestream features require a secure connection (HTTPS). Please ensure you're accessing the site securely.</p>
        )}
        
        {isCompatibilityError && (
          <p>Your browser doesn't support required livestream features. Please try a modern browser like Chrome, Firefox, or Edge.</p>
        )}
        
        {!isPermissionError && !isNotFoundError && !isSecurityError && !isCompatibilityError && (
          <p>An error occurred with the livestream: {error.message}</p>
        )}
        
        <div className="error-actions">
          <button
            onClick={handleRestart}
            className="primary-button"
            disabled={isPermissionError && hasPermissionErrors}
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="secondary-button"
          >
            Refresh Page
          </button>
        </div>
        
        {isPermissionError && hasPermissionErrors && (
          <div className="error-note">
            <small>
              You'll need to allow camera permissions before continuing.
              After allowing access, please refresh the page.
            </small>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <ErrorBoundary
      fallback={renderFallback}
      onError={handleMediaError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default LivestreamErrorBoundary;