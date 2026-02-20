import type { ImageCache } from '../types/state';

const API_BASE = 'https://en.wikipedia.org/w/api.php';

export function hiResUrl(url: string): string {
  if (!url) return url;
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

const EXCLUDED_PATTERNS = [
  /^File:Flag[_ ]/i,
  /^File:Map[_ ]/i,
  /^File:Icon[_ ]/i,
  /^File:Logo[_ ]/i,
  /^File:Coat[_ ]of[_ ]arms/i,
  /^File:Commons[_-]/i,
  /^File:Wikispecies/i,
  /^File:Status[_ ]iucn/i,
  /^File:Red[_ ]Pencil/i,
  /^File:Question[_ ]book/i,
  /^File:Edit-clear/i,
  /^File:Increase/i,
  /^File:Decrease/i,
  /^File:Steady/i,
  /^File:Symbol[_ ]/i,
  /^File:Crystal[_ ]/i,
  /^File:Ambox/i,
  /^File:Wiki/i,
  /^File:Folder/i,
  /^File:Text-/i,
  /^File:Audio-/i,
  /^File:Speaker/i,
  /^File:Padlock/i,
  /^File:Lock-/i,
  /^File:Semi-protection/i,
  /^File:Portal/i,
  /\.svg$/i,
  /\.ogg$/i,
  /\.ogv$/i,
  /\.wav$/i,
];

function isPhotoFile(title: string): boolean {
  return !EXCLUDED_PATTERNS.some((p) => p.test(title));
}

export async function fetchGalleryImages(slug: string): Promise<string[]> {
  try {
    const title = slug.replace(/_/g, ' ');
    const resp = await fetch(
      `${API_BASE}?action=query&titles=${encodeURIComponent(title)}&prop=images&imlimit=20&format=json&origin=*`,
      { signal: AbortSignal.timeout(10000) },
    );
    const data = await resp.json();
    if (!data.query?.pages) return [];

    const page = Object.values(data.query.pages)[0] as { images?: Array<{ title: string }> };
    if (!page?.images?.length) return [];

    const photoFiles = page.images.filter((img) => isPhotoFile(img.title)).slice(0, 8);
    if (photoFiles.length === 0) return [];

    const fileTitles = photoFiles.map((f) => f.title).join('|');
    const infoResp = await fetch(
      `${API_BASE}?action=query&titles=${encodeURIComponent(fileTitles)}&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*`,
      { signal: AbortSignal.timeout(10000) },
    );
    const infoData = await infoResp.json();
    if (!infoData.query?.pages) return [];

    const urls: string[] = [];
    for (const p of Object.values(infoData.query.pages) as Array<{
      imageinfo?: Array<{ thumburl?: string; url?: string }>;
    }>) {
      const url = p.imageinfo?.[0]?.thumburl ?? p.imageinfo?.[0]?.url;
      if (url) urls.push(url);
    }

    return urls.slice(0, 6);
  } catch (err) {
    console.log('Gallery fetch error:', err);
    return [];
  }
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
