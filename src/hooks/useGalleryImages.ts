import { useState, useEffect, useRef } from 'react';
import type { UserPhoto } from '../types/state';
import { loadPhotoIndex, getPhotoBlob } from '../utils/photoStorage';

interface GalleryResult {
  images: string[];
  photos: UserPhoto[];
  loading: boolean;
}

export function useGalleryImages(animalId: string | null): GalleryResult {
  const [images, setImages] = useState<string[]>([]);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Revoke previous blob URLs
      for (const url of blobUrlsRef.current) URL.revokeObjectURL(url);
      blobUrlsRef.current = [];

      if (!animalId) {
        setImages([]);
        setPhotos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const index = loadPhotoIndex();
      const entries = index[animalId] ?? [];

      const urls: string[] = [];
      const validPhotos: UserPhoto[] = [];

      for (const entry of entries) {
        const blob = await getPhotoBlob(entry.id);
        if (blob && !cancelled) {
          const url = URL.createObjectURL(blob);
          urls.push(url);
          validPhotos.push(entry);
          blobUrlsRef.current.push(url);
        }
      }

      if (!cancelled) {
        setImages(urls);
        setPhotos(validPhotos);
        setLoading(false);
      }
    }

    load();

    const handler = () => { load(); };
    window.addEventListener('photo-index-changed', handler);

    return () => {
      cancelled = true;
      window.removeEventListener('photo-index-changed', handler);
      for (const url of blobUrlsRef.current) URL.revokeObjectURL(url);
      blobUrlsRef.current = [];
    };
  }, [animalId]);

  return { images, photos, loading };
}
