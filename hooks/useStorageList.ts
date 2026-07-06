import { useEffect, useState } from 'react';
import type { WxtStorageItem } from '#imports';

/** Subscribe to a WXT storage item holding a list; stays in sync across contexts. */
export function useStorageItem<T>(item: WxtStorageItem<T, Record<string, unknown>>): {
  value: T;
  loaded: boolean;
  setValue: (next: T) => Promise<void>;
} {
  const [value, setValue] = useState<T>(item.fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    item.getValue().then((v) => {
      if (!cancelled) {
        setValue(v);
        setLoaded(true);
      }
    });
    const unwatch = item.watch((v) => setValue(v));
    return () => {
      cancelled = true;
      unwatch();
    };
  }, [item]);

  return {
    value,
    loaded,
    setValue: async (next: T) => {
      setValue(next);
      await item.setValue(next);
    },
  };
}
