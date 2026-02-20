import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResolvedAnimal, BrowseAnimal } from '../../types/animals';
import { ANIMALS } from '../../data/animals';
import { CATEGORY_COLORS } from '../../data/constants';
import { conservationClass, rarityClass } from '../../utils/colors';
import { useGalleryImages } from '../../hooks/useGalleryImages';
import CheckButton from './CheckButton';
import { openLightbox } from '../common/Lightbox';
import type { ViewMode } from '../../types/state';

interface CrossParkSighting {
  parkId: string;
  parkName: string;
  date: string;
}

interface Props {
  animal: ResolvedAnimal | BrowseAnimal;
  isChecked: boolean;
  isExpanded: boolean;
  viewMode: ViewMode;
  imageUrl: string | null;
  onToggleCheck: (e: React.MouseEvent) => void;
  onToggleExpand: () => void;
  crossParkSightings?: CrossParkSighting[];
  currentParkId?: string;
  spottedDate?: string;
  browseMode?: boolean;
  parkFilter?: string;
}

export default function AnimalCard({
  animal,
  isChecked,
  isExpanded,
  viewMode,
  imageUrl,
  onToggleCheck,
  onToggleExpand,
  crossParkSightings = [],
  currentParkId,
  spottedDate,
  browseMode = false,
  parkFilter,
}: Props) {
  const navigate = useNavigate();
  const a = animal;
  const clr = CATEGORY_COLORS[a.category]?.bg ?? '#888';
  const rCls = rarityClass(a.rarity);
  const csStatus = ANIMALS[a._id]?.conservationStatus;
  const csC = csStatus ? conservationClass(csStatus) : null;
  const xpOther = crossParkSightings.filter((s) => s.parkId !== currentParkId);

  // Gallery images
  const slug = imageUrl ? (ANIMALS[a._id]?.wikipediaSlug ?? null) : null;
  const { images: galleryImages } = useGalleryImages(slug);
  const allImages = imageUrl ? [imageUrl, ...galleryImages] : [];
  const multi = allImages.length > 1;

  const [activeSlide, setActiveSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const swipedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; scrollLeft: number } | null>(null);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveSlide(idx);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipedRef.current = false;
    touchStartRef.current = {
      x: e.touches[0]!.clientX,
      scrollLeft: trackRef.current?.scrollLeft ?? 0,
    };
  }, []);

  const handleTouchMove = useCallback(() => {
    const el = trackRef.current;
    if (!el || !touchStartRef.current) return;
    if (Math.abs(el.scrollLeft - touchStartRef.current.scrollLeft) > 10) {
      swipedRef.current = true;
    }
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-check]') || target.closest('[data-expand]') || target.closest('[data-profile]') || target.closest('.cc-dots'))
      return;
    if (target.closest('.cc-track') && swipedRef.current) return;
    if (viewMode === 'grid') {
      navigate(`/animal/${a._id}`);
      return;
    }
    onToggleExpand();
  };

  const handleLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;
    if (allImages.length > 1) {
      openLightbox(allImages, activeSlide, a.name, a.emoji, a.rarity);
    } else {
      openLightbox(imageUrl, a.name, a.emoji, a.rarity);
    }
  };

  // For browse mode, get tips from the right park
  const browseAnimal = a as BrowseAnimal;
  const tipPark =
    browseMode && browseAnimal._parks
      ? parkFilter && parkFilter !== 'All'
        ? browseAnimal._parks.find((p) => p.parkId === parkFilter)
        : browseAnimal._parks[0]
      : null;
  const tip = browseMode ? tipPark?.tip : a.tip;

  return (
    <article className={`ac${isChecked ? ' ck' : ''}`}>
      <div className="cv" onClick={handleCardClick}>
        {imageUrl && multi ? (
          <div className="cc-track" ref={trackRef} onScroll={handleScroll} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
            {allImages.map((url, i) => (
              <img
                key={i}
                className="cc-slide"
                src={url}
                alt={`${a.name} ${i + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
        ) : imageUrl ? (
          <img
            className="ci"
            src={imageUrl}
            alt={a.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const next = e.currentTarget.nextElementSibling as HTMLElement;
              if (next) next.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="cp" style={imageUrl ? { display: 'none' } : undefined}>
          {a.emoji}
        </div>
        <div className="cg" />
        {imageUrl && (
          <button className="cv-expand" data-expand onClick={handleLightbox}>
            ⛶
          </button>
        )}
        {multi && (
          <div className="cc-dots">
            {allImages.map((_, i) => (
              <span key={i} className={`cc-dot${i === activeSlide ? ' active' : ''}`} />
            ))}
          </div>
        )}
        <CheckButton checked={isChecked} onClick={(e) => { e.stopPropagation(); onToggleCheck(e); }} />
        <div className="cio">
          <div className="cn">{a.name}</div>
          <div className="cta">
            <span className="ctg ctg-s" style={{ background: `${clr}30`, color: clr }}>
              {a.subcategory}
            </span>
            <span className={`rb ${rCls}`}>{a.rarity}</span>
            <span className="ctg ctg-z">
              {a.size} • {a.color}
            </span>
            {csStatus && <span className={`ctg ap-cs-pill ap-cs-${csC}`}>{csStatus}</span>}
          </div>
        </div>
        <span className={`ceh${isExpanded ? ' o' : ''}`}>▼</span>
      </div>

      <div className={`cd${isExpanded ? ' open' : ''}`}>
        <div className="cd-wrap">
          <div className="cdi">
            {tip && (
              <div className="ds">
                <div className="dl">💡 Safari Tip</div>
                <div className="dt">{tip}</div>
              </div>
            )}
            {a.description && (
              <div className="ds">
                <div className="dl">📖 About</div>
                <div className="dd">{a.description}</div>
              </div>
            )}
            {(a.weight || a.length || a.lifespan || a.activity || a.diet) && (
              <div className="ds">
                <div className="dl">📊 Quick Facts</div>
                <div className="dg">
                  {a.weight && (
                    <div className="dst">
                      <div className="dsl">⚖️ Weight</div>
                      <div className="dsv">{a.weight}</div>
                    </div>
                  )}
                  {a.length && (
                    <div className="dst">
                      <div className="dsl">📏 Size</div>
                      <div className="dsv">{a.length}</div>
                    </div>
                  )}
                  {a.lifespan && (
                    <div className="dst">
                      <div className="dsl">⏳ Lifespan</div>
                      <div className="dsv">{a.lifespan}</div>
                    </div>
                  )}
                  {a.activity && (
                    <div className="dst">
                      <div className="dsl">🕒 Activity</div>
                      <div className="dsv">{a.activity}</div>
                    </div>
                  )}
                </div>
                {a.diet && (
                  <div style={{ marginTop: 8 }}>
                    <div className="dst">
                      <div className="dsl">🌿 Diet</div>
                      <div className="dsv">{a.diet}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {spottedDate && (
              <div className="ds">
                <div className="spb">✓ Spotted on {new Date(spottedDate).toLocaleDateString()}</div>
              </div>
            )}
            {!browseMode && xpOther.length > 0 && (
              <div className="ds">
                <CrossParkBadge sightings={crossParkSightings} otherCount={xpOther.length} />
              </div>
            )}
            {browseMode && crossParkSightings.length > 0 && (
              <>
                {crossParkSightings.map((s) => (
                  <div className="ds" key={s.parkId}>
                    <div className="spb">
                      ✓ Spotted in {s.parkName} on {new Date(s.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </>
            )}
            {browseMode && browseAnimal._parks && (
              <div className="ds">
                <div className="dl">🏞️ Available In</div>
                {browseAnimal._parks.filter((p) => p.parkId !== 'wild').map((p) => (
                  <div className="xp-row" key={p.parkId}>
                    {p.parkName} — {p.rarity}
                  </div>
                ))}
              </div>
            )}
            <div className="ds">
              <button
                className="ap-link"
                data-profile
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/animal/${a._id}`);
                }}
              >
                View Full Profile →
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function CrossParkBadge({
  sightings,
  otherCount,
}: {
  sightings: CrossParkSighting[];
  otherCount: number;
}) {
  const text =
    sightings.length > 1
      ? `Seen in ${sightings.length} parks`
      : `Also seen in ${sightings.find((_, i) => i === otherCount - 1)?.parkName ?? ''}`;

  return (
    <div className="xp-badge" onClick={(e) => {
      e.stopPropagation();
      (e.currentTarget as HTMLElement).classList.toggle('show');
    }}>
      🌍 {text}
      <div className="xp-tooltip">
        {sightings.map((s) => (
          <div className="xp-row" key={s.parkId}>
            {s.parkName} — {new Date(s.date).toLocaleDateString()}
          </div>
        ))}
      </div>
    </div>
  );
}
