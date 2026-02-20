import type { ImageCache } from '../types/state';

const API_BASE = 'https://en.wikipedia.org/w/api.php';

export function hiResUrl(url: string): string {
  if (!url || url.startsWith('blob:')) return url;
  return url.replace(/\/(\d+)px-/, (_m, w) => `/${Math.min(parseInt(w) * 2, 1280)}px-`);
}


export async function fetchImages(
  slugs: string[],
  existingCache: ImageCache,
): Promise<ImageCache> {
  const missing = slugs.filter((s) => s && !existingCache[s]);
  if (missing.length === 0) return existingCache;

  const newCache = { ...existingCache };

  for (let i = 0; i < missing.length; i += 50) {
    const batch = missing.slice(i, i + 50);
    const titles = batch.join('|');
    try {
      const resp = await fetch(
        `${API_BASE}?action=query&titles=${titles}&prop=pageimages&format=json&pithumbsize=640&origin=*&redirects=1`,
        { signal: AbortSignal.timeout(10000) },
      );
      const data = await resp.json();
      if (data.query?.pages) {
        for (const p of Object.values(data.query.pages) as Array<{
          title: string;
          thumbnail?: { source: string };
        }>) {
          if (p.thumbnail?.source) {
            const key = p.title.replace(/ /g, '_');
            newCache[key] = p.thumbnail.source;
            // Match original slugs by normalized comparison
            for (const slug of batch) {
              if (!newCache[slug]) {
                const normTitle = slug.replace(/_/g, ' ');
                if (
                  p.title === normTitle ||
                  p.title.toLowerCase() === normTitle.toLowerCase()
                ) {
                  newCache[slug] = p.thumbnail.source;
                }
              }
            }
          }
        }
        // Handle redirects
        if (data.query.redirects) {
          for (const rd of data.query.redirects as Array<{ from: string; to: string }>) {
            const fromKey = rd.from.replace(/ /g, '_');
            const toKey = rd.to.replace(/ /g, '_');
            if (newCache[toKey] && !newCache[fromKey]) newCache[fromKey] = newCache[toKey];
          }
        }
        // Handle normalization
        if (data.query.normalized) {
          for (const n of data.query.normalized as Array<{ from: string; to: string }>) {
            const fromKey = n.from.replace(/ /g, '_');
            const toKey = n.to.replace(/ /g, '_');
            if (newCache[toKey] && !newCache[fromKey]) newCache[fromKey] = newCache[toKey];
          }
        }
      }
    } catch (err) {
      console.log('Image load error:', err);
    }
  }

  return newCache;
}

const extractCache: Record<string, string> = {};

export async function fetchWikiExtract(pageTitle: string): Promise<string | null> {
  if (extractCache[pageTitle]) return extractCache[pageTitle];
  try {
    const resp = await fetch(
      `${API_BASE}?action=query&titles=${encodeURIComponent(pageTitle.replace(/_/g, ' '))}&prop=extracts&exintro&explaintext&format=json&origin=*`,
      { signal: AbortSignal.timeout(10000) },
    );
    const data = await resp.json();
    if (data.query?.pages) {
      const page = Object.values(data.query.pages)[0] as {
        extract?: string;
      };
      if (page?.extract) {
        extractCache[pageTitle] = page.extract;
        return page.extract;
      }
    }
  } catch (err) {
    console.log('Wiki fetch error:', err);
  }
  return null;
}
