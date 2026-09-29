import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal async loader for dashboard pages: data, error, loading and reload. */
export function useLoader<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const loadRef = useRef(load);
  loadRef.current = load;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loadRef.current());
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: caller controls reload deps
  useEffect(() => {
    void reload();
  }, deps);

  return { data, error, loading, reload, setData };
}

export function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String((error as Error).message);
  return "Something went wrong.";
}
