import { useEffect, useRef } from "react";
import axios, { CancelTokenSource } from "axios";

/**
 * Hook to create a cancel token for API requests
 * Automatically cancels requests when component unmounts
 */
export const useCancelToken = () => {
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    return () => {
      // Cancel any pending requests on unmount
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounted");
      }
    };
  }, []);

  const getCancelToken = (): CancelTokenSource => {
    // Cancel previous request if exists
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("New request initiated");
    }

    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source();
    return cancelTokenRef.current;
  };

  const cancel = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("Request cancelled");
    }
  };

  return { getCancelToken, cancel };
};

/**
 * Create a cancel token source
 */
export const createCancelToken = (): CancelTokenSource => {
  return axios.CancelToken.source();
};

/**
 * Check if error is from cancellation
 */
export const isCancelError = (error: any): boolean => {
  return axios.isCancel(error);
};

