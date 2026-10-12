import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic data-fetching hook used across feature pages for loading/error/success
 * state without duplicating the same try/catch/cancellation boilerplate in
 * every page. `deps` re-triggers the fetch (e.g., on filter/page change).
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(() => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    fetcherRef.current()
      .then((result) => {
        if (requestId.current === id) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (requestId.current === id) {
          setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
          setIsLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
