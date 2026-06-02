import { useEffect, useState } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
}

/**
 * Lightweight async data hook with race-condition handling. Resets loading
 * state on key change and ignores stale resolutions.
 *
 * The synchronous `setLoading(true)` inside the effect is intentional and
 * correct for this pattern (data fetch on param change). The React 19 lint
 * rule is suppressed here because the alternative (a `key` prop) would force
 * remounting the whole consumer component, which is heavier.
 */
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
