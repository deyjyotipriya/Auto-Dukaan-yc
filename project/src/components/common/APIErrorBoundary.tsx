import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface APIErrorProps {
  children: React.ReactNode;
  serviceName?: string;
  onRetry?: () => void;
  fallbackComponent?: React.ReactNode;
}

/**
 * API Error Boundary for catching and handling API-related errors
 * 
 * This component provides specialized error handling for API calls including:
 * - Network errors
 * - API response errors
 * - Authentication failures
 * - Timeout issues
 */
const APIErrorBoundary: React.FC<APIErrorProps> = ({ 
  children, 
  serviceName, 
  onRetry, 
  fallbackComponent 
}) => {
  // Track failed API attempts
  const [attemptCount, setAttemptCount] = React.useState(0);
  
  const handleAPIError = (error: Error) => {
    console.error(`API Error in ${serviceName || 'unknown service'}:`, error);
    
    // Track error in analytics or report to monitoring service
    try {
      if (window.analytics) {
        window.analytics.track('API Error', {
          service: serviceName,
          error: error.message,
          timestamp: new Date().toISOString(),
          attemptCount
        });
      }
    } catch (analyticsError) {
      console.warn('Failed to log API error to analytics:', analyticsError);
    }
    
    // Increment attempt counter
    setAttemptCount(count => count + 1);
  };

  const renderFallback = (error: Error, resetError: () => void) => {
    // Use custom fallback if provided
    if (fallbackComponent) {
      return fallbackComponent;
    }

    // Categorize the error type
    const isNetworkError = error.message.includes('network') || 
                          error.message.includes('fetch') ||
                          error.message.includes('connection');
                          
    const isAuthError = error.message.includes('unauthorized') || 
                       error.message.includes('authentication') ||
                       error.message.includes('403') ||
                       error.message.includes('401');
    
    const isTimeoutError = error.message.includes('timeout') || 
                          error.message.includes('timed out');

    const getErrorMessage = () => {
      if (isNetworkError) return 'Network connectivity issue detected.';
      if (isAuthError) return 'Authentication or authorization error.';
      if (isTimeoutError) return 'Request timed out. Server might be busy.';
      return 'An error occurred while communicating with the server.';
    };

    const handleRetry = () => {
      if (onRetry) {
        onRetry();
      }
      resetError();
    };

    return (
      <div className="api-error-boundary">
        <h3>{serviceName ? `${serviceName} Error` : 'API Error'}</h3>
        <p>{getErrorMessage()}</p>
        <div className="error-details">
          <code>{error.message}</code>
        </div>
        <div className="error-actions">
          <button
            onClick={handleRetry}
            className="primary-button"
            disabled={attemptCount >= 3}
          >
            {attemptCount >= 3 ? 'Too Many Attempts' : 'Try Again'}
          </button>
          {isAuthError && (
            <button
              onClick={() => window.location.href = '/login'}
              className="secondary-button"
            >
              Go to Login
            </button>
          )}
        </div>
        {attemptCount >= 3 && (
          <div className="error-note">
            <small>
              We're having trouble connecting to our servers. 
              Please try again later or contact support if the issue persists.
            </small>
          </div>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary 
      fallback={renderFallback}
      onError={handleAPIError}
    >
      {children}
    </ErrorBoundary>
  );
};

// Add global window interface for analytics
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
    }
  }
}

export default APIErrorBoundary;