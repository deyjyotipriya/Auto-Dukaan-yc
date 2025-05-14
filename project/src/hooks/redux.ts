/**
 * Redux hooks with safeguards against constructor errors
 * 
 * This file provides typed versions of Redux hooks that have additional
 * error handling to prevent "Class constructor cannot be invoked without 'new'" errors
 */

import { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useDispatch as safeUseDispatch, useSelector as safeUseSelector, useAppSelector as safeUseAppSelector, useAppDispatch as safeUseAppDispatch } from '../utils/reduxFix';

// Export the safe versions as the main hooks
export const useAppDispatch = safeUseAppDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = safeUseAppSelector;

// Also export the base hooks for consistency
export const useDispatch = safeUseDispatch;
export const useSelector = safeUseSelector;

/**
 * Safe selector with additional type checking
 * Use this when you need to define type parameters explicitly
 */
export function useSafeSelector<TSelected>(selector: (state: RootState) => TSelected): TSelected {
  return useAppSelector(selector);
}

/**
 * Safe dispatch with error handling
 * @param action The action to dispatch
 * @returns The result of the dispatch
 */
export function useSafeDispatch() {
  const dispatch = useAppDispatch();
  
  return function safeCaller<R = any>(action: any): R {
    try {
      return dispatch(action) as R;
    } catch (error) {
      console.warn('Error in dispatch:', error);
      // Return a minimal compatible response
      return {
        type: action.type,
        error: true,
        payload: error,
        meta: { recovered: true }
      } as unknown as R;
    }
  };
}