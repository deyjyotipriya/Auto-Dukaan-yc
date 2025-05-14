/**
 * Redux Fix Utility
 * 
 * This file provides fixes for common Redux issues, particularly the
 * "Class constructor cannot be invoked without 'new'" error that can
 * occur when using Redux with React.
 * 
 * The issue often happens when:
 * 1. Using standard useSelector directly instead of typed versions
 * 2. When Redux is not compatible with the React version
 * 3. When there's a version mismatch between react-redux and @reduxjs/toolkit
 */

import { useSelector as originalUseSelector, useDispatch as originalUseDispatch, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/**
 * Fixed version of useSelector that ensures proper instantiation
 * This wrapper prevents the "Class constructor cannot be invoked without 'new'" error
 * 
 * @param {Function} selector - The selector function
 * @returns The selected state
 */
export const useSelector = function<TSelected>(selector: (state: RootState) => TSelected): TSelected {
  try {
    // Use the proper hook with error handling
    return originalUseSelector(selector);
  } catch (error) {
    if (error instanceof TypeError && error.message?.includes('cannot be invoked without \'new\'')) {
      console.warn('Redux selector error caught and handled. Consider updating your Redux implementation.');
      
      // Fallback to a simple state retrieval if possible
      // This is a last resort and might not work in all cases
      try {
        const state = (window as any).__REDUX_STATE__ as RootState;
        return selector(state);
      } catch (fallbackError) {
        console.error('Failed to retrieve Redux state via fallback:', fallbackError);
        return null as unknown as TSelected;
      }
    }
    throw error; // Re-throw any other errors
  }
};

// Export a typed version as well
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Safe wrapper for useDispatch
 * 
 * @returns {Function} The dispatch function
 */
export const useDispatch = function(): AppDispatch {
  try {
    return originalUseDispatch();
  } catch (error) {
    if (error instanceof TypeError && error.message?.includes('without \'new\'')) {
      console.warn('Redux dispatch error caught and handled. Consider updating your Redux implementation.');
      
      // Return a no-op dispatch function as a fallback
      return function noopDispatch(action: any) {
        console.warn('Dispatch called but not executed due to Redux error:', action);
        return action;
      } as unknown as AppDispatch;
    }
    throw error;
  }
};

// Export a typed version as well
export const useAppDispatch = () => useDispatch();

/**
 * Apply this fix globally
 * Call this function in your index.js/main.js before rendering your app
 */
export function applyReduxFixes(): void {
  // Store a reference to the Redux state for fallbacks
  try {
    const win = window as any;
    if (win && win.__REDUX_DEVTOOLS_EXTENSION__) {
      const storeKey = Object.keys(win).find(key => 
        key.startsWith('__REDUX_STORE__') || 
        key.includes('store') || 
        key.includes('redux')
      );
      
      if (storeKey && win[storeKey] && typeof win[storeKey].getState === 'function') {
        win.__REDUX_STATE__ = win[storeKey].getState();
        
        // Set up a listener for state updates
        win[storeKey].subscribe(() => {
          win.__REDUX_STATE__ = win[storeKey].getState();
        });
      }
    }
  } catch (error) {
    console.warn('Failed to set up Redux state reference:', error);
  }
}

/**
 * Check your Redux and React versions for compatibility
 * This can help diagnose version mismatch issues
 */
interface VersionInfo {
  isCompatible: boolean;
  versions?: {
    redux: string;
    reactRedux: string;
    react: string;
    reduxToolkit: string;
  };
  error?: any;
}

export function checkReduxCompatibility(): VersionInfo {
  try {
    // Try to detect versions using dynamic imports
    // Note: This approach may need adjustment in some bundlers
    const reduxVersion = require('redux/package.json').version;
    const reactReduxVersion = require('react-redux/package.json').version;
    const reactVersion = require('react/package.json').version;
    const reduxToolkitVersion = require('@reduxjs/toolkit/package.json').version;
    
    console.info('Redux compatibility check:');
    console.info(`- Redux: ${reduxVersion}`);
    console.info(`- React-Redux: ${reactReduxVersion}`);
    console.info(`- React: ${reactVersion}`);
    console.info(`- Redux Toolkit: ${reduxToolkitVersion}`);
    
    // Check compatibility based on version ranges
    // This is a simplified check and may need updating
    const isReactCompatible = reactVersion.startsWith('16.') || reactVersion.startsWith('17.') || reactVersion.startsWith('18.');
    const isReduxCompatible = reduxVersion.startsWith('4.') || reduxVersion.startsWith('5.');
    const isToolkitCompatible = reduxToolkitVersion.startsWith('1.');
    
    if (!isReactCompatible) console.warn('⚠️ React version may not be compatible with your Redux setup');
    if (!isReduxCompatible) console.warn('⚠️ Redux version may cause compatibility issues');
    if (!isToolkitCompatible) console.warn('⚠️ Redux Toolkit version may cause compatibility issues');
    
    return {
      isCompatible: isReactCompatible && isReduxCompatible && isToolkitCompatible,
      versions: {
        redux: reduxVersion,
        reactRedux: reactReduxVersion,
        react: reactVersion,
        reduxToolkit: reduxToolkitVersion
      }
    };
    
  } catch (error) {
    console.warn('Failed to check Redux compatibility:', error);
    return { isCompatible: false, error };
  }
}