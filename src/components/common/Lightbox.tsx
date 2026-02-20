import { useState, useEffect, useCallback, useRef } from 'react';
import { hiResUrl } from '../../services/wikipedia';
import { rarityClass } from '../../utils/colors';
import { deletePhoto } from '../../utils/capturePhoto';
import type { Rarity } from '../../types/animals';
import type { UserPhoto } from '../../types/state';

interface LightboxData {
  images: string[];
  startIndex: number;
  name: string;
  emoji: string;
  rarity: Rarity;
  photoMeta?: (UserPhoto | undefined)[];
}

let openLightboxFn: ((data: LightboxData) => void) | null = null;

export function openLightbox(url: string, name: string, emoji: string, rarity: Rarity): void;
export function openLightbox(images: string[], startIndex: number, name: string, emoji: string, rarity: Rarity, photoMeta?: (UserPhoto | undefined)[]): void;
export function openLightbox(
  images: string | string[],
  startIndexOrName: number | string,
  nameOrEmoji: string,
  emojiOrRarity: string | Rarity,
  rarity?: Rarity,
  photoMeta?: (UserPhoto | undefined)[],
) {
  if (typeof images === 'string') {
    openLightboxFn?.({
      images: [images],
      startIndex: 0,
      name: startIndexOrName as string,
      emoji: nameOrEmoji,
      rarity: emojiOrRarity as Rarity,
    });
  } else {
    openLightboxFn?.({
      images,
      startIndex: startIndexOrName as number,
      name: nameOrEmoji,
      emoji: emojiOrRarity as string,
      rarity: rarity!,
      photoMeta,
    });
  }
}

export default function Lightbox() {
  const [data, setData] = useState<LightboxData | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    openLightboxFn = (d) => {
      setData(d);
      setIndex(d.startIndex);
      setOpen(true);
      document.body.style.overflow = 'hidden';
    };
    return () => {
      openLightboxFn = null;
    };
  }, []);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = '';
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setData(null), 300);
  }, []);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const goNext = useCallback(() => {
    if (!data || data.images.length <= 1) return;
    setIndex((i) => (i + 1) % data.images.length);
  }, [data]);

  const goPrev = useCallback(() => {
    if (!data || data.images.length <= 1) return;
    setIndex((i) => (i - 1 + data.images.length) % data.images.length);
  }, [data]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close, goNext, goPrev]);

  // Preload adjacent images
  useEffect(() => {
    if (!data || data.images.length <= 1) return;
    const preload = (i: number) => {
      const img = new Image();
      img.src = hiResUrl(data.images[i]!);
    };
    preload((index + 1) % data.images.length);
    if (data.images.length > 2) preload((index - 1 + data.images.length) % data.images.length);
  }, [data, index]);

  const imgErrorRef = useRef(false);

  // Reset error flag when image changes
  useEffect(() => {
    imgErrorRef.current = false;
  }, [index, data]);

  const currentPhotoMeta = data?.photoMeta?.[index];

  const handleDelete = useCallback(async () => {
    if (!data || !currentPhotoMeta) return;
    const ok = window.confirm('Delete this photo?');
    if (!ok) return;

    await deletePhoto(currentPhotoMeta.animalId, currentPhotoMeta.id);

    const newImages = data.images.filter((_, i) => i !== index);
    const newMeta = data.photoMeta?.filter((_, i) => i !== index);

    if (newImages.length === 0) {
      close();
    } else {
      const newIndex = index >= newImages.length ? newImages.length - 1 : index;
      setData({ ...data, images: newImages, photoMeta: newMeta });
      setIndex(newIndex);
    }
  }, [data, currentPhotoMeta, index, close]);

  const rCls = data ? rarityClass(data.rarity) : '';
  const multi = data && data.images.length > 1;

  return (
    <div
      className={`lb-overlay${open ? ' open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('lb-content'))
          close();
      }}
    >
      <div className="lb-content">
        <button className="lb-close" onClick={close}>
          &times;
        </button>
        <div className="lb-img-wrap">
          {data && (
            <img
              className="lb-img"
              src={hiResUrl(data.images[index]!)}
              alt={data.name}
              onError={(e) => {
                if (imgErrorRef.current) return;
                imgErrorRef.current = true;
                e.currentTarget.src = data.images[index]!;
              }}
            />
          )}
          {multi && (
            <>
              <button className="lb-nav lb-nav-l" onClick={(e) => { e.stopPropagation(); goPrev(); }}>
                &#8249;
              </button>
              <button className="lb-nav lb-nav-r" onClick={(e) => { e.stopPropagation(); goNext(); }}>
                &#8250;
              </button>
            </>
          )}
        </div>
        {data && (
          <div className="lb-info">
            <span className="lb-emoji">{data.emoji}</span>
            <span className="lb-name">{data.name}</span>
            <span className={`lb-rarity rb ${rCls}`}>{data.rarity}</span>
            {multi && <span className="lb-counter">{index + 1} / {data.images.length}</span>}
            {currentPhotoMeta && (
              <button className="lb-delete" onClick={handleDelete} title="Delete photo">
                &#128465;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
