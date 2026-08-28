/**
 * One data load with its lifecycle.
 *
 * Its own module because `ui.tsx` exports components, and a non-component export there breaks React
 * Fast Refresh — the lint rule that caught it is right: a mixed module reloads its whole subtree
 * instead of just the component that changed.
 *
 * Every panel needs the same four things — the data, an error string, a loading flag and a way to
 * reload — and each hand-rolled copy was a chance to forget the `alive` guard and set state after the
 * panel had gone. Which is exactly what happens here routinely: an operator clicks a rail item while
 * a request is still in flight.
 */
import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

export function useAsync<T>(load: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    load()
      .then((d) => {
        if (!alive) return;
        setData(d);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        // ApiError already carries a sentence written for an operator; anything else gets a generic
        // one rather than leaking a stack trace into the UI.
        setError(e instanceof Error ? e.message : 'Something went wrong.');
        setLoading(false);
      });

    return () => {
      alive = false;
    };
    // `load` is the caller's own useCallback and `deps` are theirs to declare.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, error, loading, reload: () => setNonce((n) => n + 1) };
}
