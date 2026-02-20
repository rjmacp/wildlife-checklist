// Gallery fetching disabled — Wikimedia Commons images were low quality.
// Keeping the hook interface so the carousel/lightbox code stays intact
// and can be re-enabled later with a better image source.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useGalleryImages(_slug: string | null, _primaryUrl?: string | null): { images: string[]; loading: boolean } {
  return { images: [], loading: false };
}
