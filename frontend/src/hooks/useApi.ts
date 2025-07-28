
import { useState, useCallback } from 'react';
import { ApiService } from '@/services/api.service';
import { useApiError } from './useApiError';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useApiError();

  const callApi = useCallback(async <T>(
    apiMethod: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<T | null> => {
    setLoading(true);
    clearError();
    try {
      const result = await apiMethod(...args);
      return result;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  return {
    api: ApiService,
    loading,
    error,
    callApi,
    clearError
  };
}
