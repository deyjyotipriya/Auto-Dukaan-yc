import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors
 * 
 * Prevents the entire app from crashing when a component throws an error.
 * Provides optional fallback UI and error reporting.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (typeof fallback === 'function' && error) {
        return fallback(error, this.resetError);
      }
      
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong.</h2>
          <p className="error-message">{error?.message || 'Unknown error occurred'}</p>
          <button 
            onClick={this.resetError}
            className="reset-button"
          >
            Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;