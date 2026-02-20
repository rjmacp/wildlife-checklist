import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResolvedAnimal, BrowseAnimal } from '../../types/animals';
import { ANIMALS } from '../../data/animals';
import { CATEGORY_COLORS } from '../../data/constants';
import { conservationClass, rarityClass } from '../../utils/colors';
import { useGalleryImages } from '../../hooks/useGalleryImages';
import { capturePhoto } from '../../utils/capturePhoto';
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

  // User photos
  const { images: userImages, photos: userPhotos } = useGalleryImages(a._id);
  const allImages = [...(imageUrl ? [imageUrl] : []), ...userImages];
  const photoMeta = [...(imageUrl ? [undefined] : []), ...userPhotos.map((p) => p)];
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
    if (target.closest('[data-check]') || target.closest('[data-expand]') || target.closest('[data-profile]') || target.closest('.cc-dots') || target.closest('[data-add-photo]'))
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
    if (allImages.length === 0) return;
    if (allImages.length > 1) {
      openLightbox(allImages, activeSlide, a.name, a.emoji, a.rarity, photoMeta);
    } else {
      if (photoMeta[0]) {
        openLightbox(allImages, 0, a.name, a.emoji, a.rarity, photoMeta);
      } else {
        openLightbox(allImages[0]!, a.name, a.emoji, a.rarity);
      }
    }
  };

  const handleAddPhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const parkId = currentParkId ?? crossParkSightings[0]?.parkId ?? 'unknown';
    await capturePhoto(a._id, parkId);
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
        {allImages.length > 1 ? (
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
        ) : allImages.length === 1 ? (
          <img
            className="ci"
            src={allImages[0]}
            alt={a.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const next = e.currentTarget.nextElementSibling as HTMLElement;
              if (next) next.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="cp" style={allImages.length > 0 ? { display: 'none' } : undefined}>
          {a.emoji}
        </div>
        <div className="cg" />
        {allImages.length > 0 && (
          <button className="cv-expand" data-expand onClick={handleLightbox}>
            &#x26F6;
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
              {a.size} &bull; {a.color}
            </span>
            {csStatus && <span className={`ctg ap-cs-pill ap-cs-${csC}`}>{csStatus}</span>}
          </div>
        </div>
        <span className={`ceh${isExpanded ? ' o' : ''}`}>&#9660;</span>
      </div>

      <div className={`cd${isExpanded ? ' open' : ''}`}>
        <div className="cd-wrap">
          <div className="cdi">
            {(isChecked || spottedDate) && (
              <div className="ds cd-actions">
                {isChecked && (
                  <button
                    className="ap-link"
                    data-add-photo
                    onClick={handleAddPhoto}
                  >
                    &#128247; Add Photo
                  </button>
                )}
                {spottedDate && (
                  <div className="spb">&#10003; Spotted on {new Date(spottedDate).toLocaleDateString()}</div>
                )}
              </div>
            )}
            {tip && (
              <div className="ds">
                <div className="dl">&#128161; Safari Tip</div>
                <div className="dt">{tip}</div>
              </div>
            )}
            {a.description && (
              <div className="ds">
                <div className="dl">&#128214; About</div>
                <div className="dd">{a.description}</div>
              </div>
            )}
            {(a.weight || a.length || a.lifespan || a.activity || a.diet) && (
              <div className="ds">
                <div className="dl">&#128202; Quick Facts</div>
                <div className="dg">
                  {a.weight && (
                    <div className="dst">
                      <div className="dsl">&#9878;&#65039; Weight</div>
                      <div className="dsv">{a.weight}</div>
                    </div>
                  )}
                  {a.length && (
                    <div className="dst">
                      <div className="dsl">&#128207; Size</div>
                      <div className="dsv">{a.length}</div>
                    </div>
                  )}
                  {a.lifespan && (
                    <div className="dst">
                      <div className="dsl">&#8987; Lifespan</div>
                      <div className="dsv">{a.lifespan}</div>
                    </div>
                  )}
                  {a.activity && (
                    <div className="dst">
                      <div className="dsl">&#128339; Activity</div>
                      <div className="dsv">{a.activity}</div>
                    </div>
                  )}
                </div>
                {a.diet && (
                  <div style={{ marginTop: 8 }}>
                    <div className="dst">
                      <div className="dsl">&#127807; Diet</div>
                      <div className="dsv">{a.diet}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!browseMode && xpOther.length > 0 && (
              <div className="ds">
                <CrossParkBadge sightings={xpOther} />
              </div>
            )}
            {browseMode && crossParkSightings.length > 0 && (
              <>
                {crossParkSightings.map((s) => (
                  <div className="ds" key={s.parkId}>
                    <div className="spb">
                      &#10003; Spotted in {s.parkName} on {new Date(s.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </>
            )}
            {browseMode && browseAnimal._parks && (
              <div className="ds">
                <div className="dl">&#127966;&#65039; Available In</div>
                {browseAnimal._parks.filter((p) => p.parkId !== 'wild').map((p) => (
                  <div className="xp-row" key={p.parkId}>
                    {p.parkName} &mdash; {p.rarity}
                  </div>
                ))}
              </div>
            )}
            <div className="ds cd-actions">
              <button
                className="ap-link"
                data-profile
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/animal/${a._id}`);
                }}
              >
                View Full Profile &rarr;
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
}: {
  sightings: CrossParkSighting[];
}) {
  const text =
    sightings.length > 1
      ? `Seen in ${sightings.length} other parks`
      : `Also seen in ${sightings[0]?.parkName ?? ''}`;

  return (
    <div className="xp-badge" onClick={(e) => {
      e.stopPropagation();
      (e.currentTarget as HTMLElement).classList.toggle('show');
    }}>
      &#127757; {text}
      <div className="xp-tooltip">
        {sightings.map((s) => (
          <div className="xp-row" key={s.parkId}>
            {s.parkName} &mdash; {new Date(s.date).toLocaleDateString()}
          </div>
        ))}
      </div>
    </div>
  );
}
