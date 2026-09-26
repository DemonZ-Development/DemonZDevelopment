import { useEffect, useState } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
}


export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetcher()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey]);

  return { data, loading, error };
}
