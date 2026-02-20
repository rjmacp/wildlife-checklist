import { useState, useEffect } from 'react';
import { fetchWikiExtract } from '../services/wikipedia';

export function useWikipediaExtract(slug: string | undefined) {
  const [extract, setExtract] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setExtract(null);

    fetchWikiExtract(slug)
      .then((text) => {
        if (!cancelled) {
          setExtract(text);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { extract, loading };
}
