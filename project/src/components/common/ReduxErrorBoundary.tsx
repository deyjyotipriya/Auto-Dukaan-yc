import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { safeDispatch } from '../../utils/reduxFix';

/**
 * Redux Error Boundary that provides specialized handling for Redux errors
 * 
 * This boundary specifically targets Redux-related errors including:
 * - "Class constructor cannot be invoked without 'new'"
 * - Redux state access errors
 * - Action dispatch failures
 * 
 * It provides recovery options specifically for Redux issues
 */
const ReduxErrorBoundary: React.FC<{ 
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}> = ({ children, fallbackComponent }) => {
  const handleReduxError = (error: Error) => {
    console.error('Redux error caught by boundary:', error);
    
    // Try to report the error or dispatch a recovery action
    try {
      // Use safeDispatch to avoid further errors
      safeDispatch({
        store: (window as any).__REDUX_STORE__,
        action: {
          type: 'system/errorOccurred',
          payload: {
            source: 'redux',
            message: error.message,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (dispatchError) {
      console.warn('Failed to dispatch error action:', dispatchError);
    }
  };

  const renderFallback = (error: Error, resetError: () => void) => {
    // If custom fallback is provided, use it
    if (fallbackComponent) {
      return fallbackComponent;
    }

    // Extract constructor name if present
    let constructorName = '';
    const constructorMatch = error.message.match(/Class constructor (\w+) cannot be invoked/i);
    if (constructorMatch && constructorMatch[1]) {
      constructorName = constructorMatch[1];
    }
    
    // Detect if this is a Redux constructor error
    const isReduxConstructorError = error.message.includes('cannot be invoked without \'new\'') ||
                                   error.message.includes('Class constructor');

    return (
      <div className="redux-error-boundary">
        <h3>Redux State Error</h3>
        <p>
          {isReduxConstructorError 
            ? 'A Redux component failed to initialize properly.'
            : 'There was a problem with the application state.'}
        </p>
        <div className="error-details">
          <code>{error.message}</code>
        </div>
        <div className="error-actions">
          <button 
            onClick={resetError}
            className="primary-button"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              // Clear cached Redux state
              if ((window as any).__REDUX_STATE__) {
                (window as any).__REDUX_STATE__ = null;
              }
              // Force refresh the page
              window.location.reload();
            }}
            className="secondary-button"
          >
            Refresh Page
          </button>
        </div>
        {isReduxConstructorError && (
          <div className="error-note">
            <small>
              Note: This error is related to Redux initialization issues{constructorName ? ` with the "${constructorName}" constructor` : ''}. 
              Refreshing the page may resolve it.
            </small>
          </div>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary
      fallback={renderFallback}
      onError={handleReduxError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ReduxErrorBoundary;