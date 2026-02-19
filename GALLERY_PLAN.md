# Multi-Image Gallery for Animal Cards

## Context

Animals currently show a single Wikipedia image. The goal is multiple photos per animal (male/female, different angles) with swipeable cards and an expanded gallery lightbox. Images come from the existing Wikipedia main image + supplementary images from Wikimedia Commons API.

## Architecture

### Image Source Strategy
1. **Primary image**: Keep existing Wikipedia `pageimages` API (640px thumbnail)
2. **Gallery images**: New Wikimedia Commons API calls using the animal's `wikipediaSlug` to search for additional images (3-5 per species)
3. **Lazy loading**: Gallery images fetched on-demand when a card is visible or expanded, NOT in bulk upfront

### Wikimedia Commons API
Query Commons for additional images using the Wikipedia page's associated images:
```
https://en.wikipedia.org/w/api.php?action=query&titles={slug}&prop=images&imlimit=10&format=json&origin=*
```
This returns image filenames associated with the Wikipedia article. Then fetch thumbnails:
```
https://en.wikipedia.org/w/api.php?action=query&titles={filenames}&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json&origin=*
```
Filter out icons/logos/maps (by filename patterns like `Flag_`, `Map_`, `Icon_`, `.svg`).

## Changes

### 1. `src/services/wikipedia.ts` — add `fetchGalleryImages`

New exported function:
```typescript
export async function fetchGalleryImages(slug: string): Promise<string[]>
```
- Queries Wikipedia `prop=images` for the article's associated files
- Filters out SVGs, maps, flags, icons, and other non-photo files
- Fetches thumbnail URLs (640px) for remaining files via `prop=imageinfo`
- Returns array of up to 6 image URLs (excluding the primary image)
- Handles errors gracefully (returns empty array)

### 2. `src/hooks/useGalleryImages.ts` — new hook (gallery fetch + cache)

```typescript
export function useGalleryImages(slug: string | null): { images: string[]; loading: boolean }
```
- Module-level in-memory cache: `Record<string, string[]>`
- Fetches gallery images for a single slug on demand
- Returns cached results immediately if available
- Used by AnimalCard when the card has an image and is in view

### 3. `src/components/checklist/AnimalCard.tsx` — swipeable image carousel

- Import `useGalleryImages` hook
- When card has an image, combine primary image + gallery images into an array
- Replace the single `<img>` with a swipeable carousel:
  - CSS scroll-snap container (horizontal, mandatory snap)
  - Touch swipe via native scroll behavior (no library needed)
  - Dot indicators at bottom of image area showing current position
  - Track scroll position with `onScroll` to update active dot
- The expand button opens lightbox with the full image array + current index

### 4. `src/components/common/Lightbox.tsx` — gallery mode

Update `openLightbox` signature to accept an array of images + starting index:
```typescript
export function openLightbox(
  images: string[],
  startIndex: number,
  name: string,
  emoji: string,
  rarity: Rarity
)
```

- Left/right navigation arrows (or swipe) to cycle through images
- Dot indicators or "2/5" counter
- Arrow key navigation (left/right)
- Preload adjacent images
- Keep backward compatibility: single-image calls still work (just wrap in array)

### 5. `src/styles/components.css` — carousel + gallery styles

**Card carousel** (`cc-*`):
- `.cc-track`: `display:flex; overflow-x:auto; scroll-snap-type:x mandatory; scrollbar-width:none`
- `.cc-slide`: `flex:0 0 100%; scroll-snap-align:start`
- `.cc-dots`: absolute positioned at bottom center, small dot indicators
- `.cc-dot` / `.cc-dot.active`: white dots with opacity toggle

**Lightbox gallery**:
- `.lb-nav`: left/right arrow buttons (absolute positioned)
- `.lb-counter`: "2 / 5" text indicator
- Arrow buttons: semi-transparent circles with chevrons

### 6. Update callers of `openLightbox`

- `AnimalCard.tsx` — pass full image array + current carousel index
- `AnimalProfilePage.tsx` — pass image array (primary + gallery) + index 0

## Files to modify
- `src/services/wikipedia.ts` — add `fetchGalleryImages`
- `src/hooks/useGalleryImages.ts` — **new file**
- `src/components/checklist/AnimalCard.tsx` — carousel in card
- `src/components/common/Lightbox.tsx` — gallery navigation
- `src/pages/AnimalProfilePage.tsx` — update openLightbox call
- `src/styles/components.css` — carousel + lightbox gallery styles

## Files that need NO changes
- `useWikipediaImages.ts` — primary image fetching stays the same
- `types/state.ts` — gallery cache is in-memory only, no localStorage
- `storage.ts` — no persistence needed for gallery images

## Verification
- `npm run build` succeeds
- Animal card: shows dot indicators when gallery images load; swipe left/right cycles through photos
- Expand button: opens lightbox at the currently-viewed image
- Lightbox: arrow keys and on-screen buttons navigate between images; counter shows position
- Animals with no gallery images: single image, no dots, expand works as before
- Performance: gallery images load lazily per-card, don't block initial page render
