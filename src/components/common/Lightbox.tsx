import { useState, useEffect, useCallback } from 'react';
import { hiResUrl } from '../../services/wikipedia';
import { rarityClass } from '../../utils/colors';
import type { Rarity } from '../../types/animals';

interface LightboxData {
  imgUrl: string;
  name: string;
  emoji: string;
  rarity: Rarity;
}

let openLightboxFn: ((data: LightboxData) => void) | null = null;

export function openLightbox(imgUrl: string, name: string, emoji: string, rarity: Rarity) {
  openLightboxFn?.({ imgUrl, name, emoji, rarity });
}

export default function Lightbox() {
  const [data, setData] = useState<LightboxData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    openLightboxFn = (d) => {
      setData(d);
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const rCls = data ? rarityClass(data.rarity) : '';

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
              src={hiResUrl(data.imgUrl)}
              alt={data.name}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== data.imgUrl) img.src = data.imgUrl;
              }}
            />
          )}
        </div>
        {data && (
          <div className="lb-info">
            <span className="lb-emoji">{data.emoji}</span>
            <span className="lb-name">{data.name}</span>
            <span className={`lb-rarity rb ${rCls}`}>{data.rarity}</span>
          </div>
        )}
      </div>
    </div>
  );
}
