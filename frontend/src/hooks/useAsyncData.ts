import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  initialData?: T | null;
  immediate?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
  timeoutMs?: number;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<void>;
  reset: () => void;
}

export function useAsyncData<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const {
    initialData = null,
    immediate = true,
    onError,
    onSuccess,
    timeoutMs
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);
  const lastFunctionRef = useRef<Function | null>(null);

  const execute = useCallback(async (...args: unknown[]) => {
    if (isExecutingRef.current) {
      return;
    }

    if (lastFunctionRef.current === asyncFunction) {
      if (data !== null && !loading) {
        return;
      }
    }
    lastFunctionRef.current = asyncFunction;

    const cacheKey = JSON.stringify(args);
    const now = Date.now();
    const CACHE_DURATION = 30000;

    const cached = cacheRef.current.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setData(cached.data);
      onSuccess?.(cached.data);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        isExecutingRef.current = true;
        setLoading(true);
        setError(null);
        
        let result: T;
        if (timeoutMs) {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: Operação demorou muito para responder')), timeoutMs);
          });
          
          result = await Promise.race([
            asyncFunction(...args),
            timeoutPromise
          ]) as T;
        } else {
          result = await asyncFunction(...args);
        }
        
        cacheRef.current.set(cacheKey, { data: result, timestamp: now });
        
        setData(result);
        onSuccess?.(result);
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
                setError(errorMessage);
                onError?.(err instanceof Error ? err : new Error(errorMessage));
                
                if (errorMessage.includes('Token expirado') || errorMessage.includes('Não autorizado') || errorMessage.includes('401')) {
                  return;
                }
      } finally {
        setLoading(false);
        isExecutingRef.current = false;
      }
    }, 300);
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
    
    cacheRef.current.clear();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    isExecutingRef.current = false;
    lastFunctionRef.current = null;
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

export function useFetch<T>(
  fetchFunction: (...args: unknown[]) => Promise<T>,
  dependencies: unknown[] = [],
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const asyncData = useAsyncData(fetchFunction, { ...options, immediate: false });

  useEffect(() => {
    asyncData.execute(...dependencies);
  }, [...dependencies]);

  return asyncData;
}

