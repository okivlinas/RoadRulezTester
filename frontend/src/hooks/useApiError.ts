
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/api/config';

interface UseApiErrorOptions {
  showToast?: boolean;
}

export const useApiError = (options: UseApiErrorOptions = { showToast: true }) => {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((err: any) => {
    const errorMessage = handleApiError(err);
    setError(errorMessage);
    
    if (options.showToast) {
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    return errorMessage;
  }, [toast, options.showToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};
