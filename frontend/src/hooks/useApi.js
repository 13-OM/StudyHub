import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useApi — runs an async function (usually an API call) and keeps
 * `data`, `loading` and `error` in state. Used by every data page so
 * loading spinners and error handling behave the same everywhere.
 *
 *   const { data, loading, error, reload } = useApi(() => groupService.list(filters), [filters]);
 *
 * `immediate: false` is handy when the call should happen on a button click.
 */
export const useApi = (fn, deps = [], { immediate = true, onSuccess, onError } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fnRef = useRef(fn);
  fnRef.current = fn;
  const successRef = useRef(onSuccess);
  successRef.current = onSuccess;
  const errorRef = useRef(onError);
  errorRef.current = onError;

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(...args);
      if (mounted.current) setData(result);
      successRef.current?.(result);
      return result;
    } catch (err) {
      if (mounted.current) setError(err);
      errorRef.current?.(err);
      throw err;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!immediate) return;
    execute().catch(() => {
      /* the error is already stored in state */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: execute, setData };
};

/** Delays a fast changing value (used by the search box). */
export const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

/** Closes a dropdown / drawer when the user clicks outside of it. */
export const useClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
};
