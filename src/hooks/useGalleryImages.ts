import { useState, useEffect } from 'react';
import { fetchGalleryImages } from '../services/wikipedia';

const cache: Record<string, string[]> = {};
const inflight: Record<string, Promise<string[]>> = {};

export function useGalleryImages(slug: string | null): { images: string[]; loading: boolean } {
  const [images, setImages] = useState<string[]>(slug && cache[slug] ? cache[slug] : []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;

    if (cache[slug]) {
      setImages(cache[slug]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Deduplicate in-flight requests
    if (!inflight[slug]) {
      inflight[slug] = fetchGalleryImages(slug).finally(() => {
        delete inflight[slug];
      });
    }

    inflight[slug].then((urls) => {
      cache[slug] = urls;
      if (!cancelled) {
        setImages(urls);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { images, loading };
}
