import { useState, useEffect, useRef, useCallback } from 'react';
import type { ImageCache } from '../types/state';
import { loadImageCache, saveImageCache } from '../utils/storage';
import { fetchImages } from '../services/wikipedia';

export function useWikipediaImages(slugs: string[]) {
  const [cache, setCache] = useState<ImageCache>(loadImageCache);
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);
  const slugsRef = useRef<string[]>([]);

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
    const missing = slugs.filter((s) => s && !cache[s]);
    if (missing.length === 0) {
      loadedRef.current = true;
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchImages(slugs, cache).then((newCache) => {
      if (cancelled) return;
      setCache(newCache);
      saveImageCache(newCache);
      setLoading(false);
      loadedRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [slugs, cache]);

  const getImage = useCallback(
    (slug: string): string | null => {
      return cache[slug] ?? null;
    },
    [cache],
  );

  return { getImage, loading };
}
