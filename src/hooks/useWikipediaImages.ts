import { useState, useEffect, useRef, useCallback } from 'react';
import type { ImageCache } from '../types/state';
import { loadImageCache, saveImageCache } from '../utils/storage';
import { fetchImages } from '../services/wikipedia';

export function useWikipediaImages(slugs: string[]) {
  const [cache, setCache] = useState<ImageCache>(loadImageCache);
  const loadedRef = useRef(false);
  const slugsRef = useRef<string[]>([]);
  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  // Reset loaded state when slugs change significantly
  useEffect(() => {
    const key = slugs.slice(0, 10).join(',');
    const prevKey = slugsRef.current.slice(0, 10).join(',');
    if (key !== prevKey) {
      loadedRef.current = false;
      slugsRef.current = slugs;
    }
  }, [slugs]);

  useEffect(() => {
    if (loadedRef.current || slugs.length === 0) return;
    const currentCache = cacheRef.current;
    const missing = slugs.filter((s) => s && !currentCache[s]);
    if (missing.length === 0) {
      loadedRef.current = true;
      return;
    }

    let cancelled = false;

    fetchImages(slugs, currentCache).then((newCache) => {
      if (cancelled) return;
      setCache(newCache);
      saveImageCache(newCache);
      loadedRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [slugs]);

  const getImage = useCallback(
    (slug: string): string | null => {
      return cache[slug] ?? null;
    },
    [cache],
  );

  return { getImage };
}
