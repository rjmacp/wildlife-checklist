import { useState, useEffect, useCallback } from 'react';
import { hiResUrl } from '../../services/wikipedia';
import { rarityClass } from '../../utils/colors';
import type { Rarity } from '../../types/animals';

interface LightboxData {
  images: string[];
  startIndex: number;
  name: string;
  emoji: string;
  rarity: Rarity;
}

let openLightboxFn: ((data: LightboxData) => void) | null = null;

export function openLightbox(
  images: string | string[],
  startIndexOrName: number | string,
  nameOrEmoji: string,
  emojiOrRarity: string | Rarity,
  rarity?: Rarity,
) {
  // Support both old signature: (url, name, emoji, rarity)
  // and new signature: (images[], startIndex, name, emoji, rarity)
  if (typeof images === 'string') {
    // Old signature
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

  const close = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = '';
    setTimeout(() => setData(null), 300);
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
                const img = e.currentTarget;
                if (img.src !== data.images[index]) img.src = data.images[index]!;
              }}
            />
          )}
          {multi && (
            <>
              <button className="lb-nav lb-nav-l" onClick={(e) => { e.stopPropagation(); goPrev(); }}>
                ‹
              </button>
              <button className="lb-nav lb-nav-r" onClick={(e) => { e.stopPropagation(); goNext(); }}>
                ›
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
          </div>
        )}
      </div>
    </div>
  );
}
