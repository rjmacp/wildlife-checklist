import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import Header from '../components/layout/Header';
import { ANIMALS } from '../data/animals';
import { PARKS } from '../data/parks';
import { CATEGORY_COLORS } from '../data/constants';
import { useChecklist } from '../hooks/useChecklist';
import { useWikipediaImages } from '../hooks/useWikipediaImages';
import { useWikipediaExtract } from '../hooks/useWikipediaExtract';
import { useGalleryImages } from '../hooks/useGalleryImages';
import { conservationClass, rarityClass } from '../utils/colors';
import { hiResUrl } from '../services/wikipedia';
import { capturePhoto } from '../utils/capturePhoto';
import { openLightbox } from '../components/common/Lightbox';
import type { Rarity } from '../types/animals';

interface ParkInfo {
  parkId: string;
  parkName: string;
  parkIcon: string;
  rarity: Rarity;
  tip: string;
}

export default function AnimalProfilePage() {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const animal = animalId ? ANIMALS[animalId] : undefined;
  const { checklist, toggleSpotting } = useChecklist();
  const { extract, loading: wikiLoading } = useWikipediaExtract(animal?.wikipediaSlug);

  const slugs = animal?.wikipediaSlug ? [animal.wikipediaSlug] : [];
  const { getImage } = useWikipediaImages(slugs);
  const imageUrl = animal?.wikipediaSlug ? getImage(animal.wikipediaSlug) : null;

  // User photos
  const { images: userImages, photos: userPhotos } = useGalleryImages(animalId ?? null);
  const allImages = [...(imageUrl ? [imageUrl] : []), ...userImages];
  const photoMeta = [...(imageUrl ? [undefined] : []), ...userPhotos.map((p) => p)];

  // Gather cross-park data
  const parks: ParkInfo[] = [];
  if (animalId) {
    for (const p of PARKS) {
      const sp = p.species.find((s) => s.id === animalId);
      if (sp) {
        parks.push({ parkId: p.id, parkName: p.name, parkIcon: p.icon, rarity: sp.rarity, tip: sp.tip });
      }
    }
  }

  const anySpotted = parks.some((p) => !!checklist[p.parkId]?.[animalId!]);
  const clr = animal ? (CATEGORY_COLORS[animal.category]?.bg ?? '#888') : '#888';
  const csStatus = animal?.conservationStatus;
  const csCls = csStatus ? conservationClass(csStatus) : null;

  // Spotted section toggle (default open if spotted, closed if not)
  const [spottedOpen, setSpottedOpen] = useState(anySpotted);

  // Conservation scale toggle
  const [csOpen, setCsOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [animalId]);

  if (!animal || !animalId) {
    return (
      <Container>
        <Header eyebrow="Error" title="Animal Not Found" subtitle="This animal does not exist" showBack />
      </Container>
    );
  }

  const bestRarity = (): Rarity => {
    const rarityRank: Record<string, number> = { Common: 1, Uncommon: 2, Rare: 3 };
    let r: Rarity = 'Common';
    for (const p of parks) {
      if ((rarityRank[p.rarity] ?? 0) > (rarityRank[r] ?? 0)) r = p.rarity;
    }
    return r;
  };

  const handleLightbox = (startIndex = 0) => {
    if (allImages.length === 0) return;
    const rarity = bestRarity();
    if (allImages.length > 1) {
      openLightbox(allImages, startIndex, animal.name, animal.emoji, rarity, photoMeta);
    } else {
      if (photoMeta[0]) {
        openLightbox(allImages, 0, animal.name, animal.emoji, rarity, photoMeta);
      } else {
        openLightbox(allImages[0]!, animal.name, animal.emoji, rarity);
      }
    }
  };

  // Resolve target parkId for photo upload
  const targetParkId = (): string => {
    // Most recently spotted park
    let latest: { parkId: string; date: string } | null = null;
    for (const p of parks) {
      const d = checklist[p.parkId]?.[animalId];
      if (d && (!latest || d > latest.date)) latest = { parkId: p.parkId, date: d };
    }
    if (latest) return latest.parkId;
    return parks[0]?.parkId ?? 'unknown';
  };

  const handleAddPhoto = async () => {
    await capturePhoto(animalId, targetParkId());
  };

  return (
    <Container>
      <Header eyebrow={animal.category} title={animal.name} subtitle={`${animal.emoji} ${animal.subcategory}`} showBack />

      {/* Hero image */}
      <div className="ap-hero">
        {imageUrl ? (
          <>
            <img
              className="ap-hero-img"
              src={hiResUrl(imageUrl)}
              alt={animal.name}
              onError={(e) => {
                if (e.currentTarget.src !== imageUrl) {
                  e.currentTarget.src = imageUrl;
                } else {
                  e.currentTarget.style.display = 'none';
                  const next = e.currentTarget.nextElementSibling as HTMLElement;
                  if (next) next.style.display = 'flex';
                }
              }}
            />
            <div className="ap-hero-emoji" style={{ display: 'none' }}>
              {animal.emoji}
            </div>
            <button className="cv-expand" onClick={() => handleLightbox(0)}>
              &#x26F6;
            </button>
          </>
        ) : (
          <div className="ap-hero-emoji">{animal.emoji}</div>
        )}
        <div className="ap-hero-overlay" />
      </div>

      {/* User photo thumbnails */}
      {userImages.length > 0 && (
        <div className="ap-user-photos">
          {userImages.map((url, i) => (
            <img
              key={userPhotos[i]?.id ?? i}
              className="ap-thumb"
              src={url}
              alt={`User photo ${i + 1}`}
              onClick={() => handleLightbox(imageUrl ? i + 1 : i)}
            />
          ))}
        </div>
      )}

      {/* Tags */}
      <div className="ap-tags" style={{ marginTop: 14 }}>
        <span className="ctg ctg-s" style={{ background: `${clr}30`, color: clr }}>
          {animal.category}
        </span>
        <span className="ctg ctg-s" style={{ background: `${clr}20`, color: clr }}>
          {animal.subcategory}
        </span>
        <span className="ctg ctg-z">{animal.size}</span>
        <span className="ctg ctg-z">{animal.color}</span>
      </div>

      {/* Spotted status */}
      <div className={`ap-spotted${anySpotted ? ' ap-spotted-yes' : ''}`}>
        <div className="ap-spotted-header" style={{ cursor: 'pointer' }} onClick={() => setSpottedOpen(!spottedOpen)}>
          {anySpotted ? '✓' : '👁'} {anySpotted ? 'Spotted' : 'Not Yet Spotted'}
          <span className="ap-cs-arrow">{spottedOpen ? '▼' : '▶'}</span>
        </div>
        <div className={`ap-spotted-expand${spottedOpen ? ' open' : ''}`}>
          <div className="ap-spotted-parks">
            {parks.map((p) => {
              const date = checklist[p.parkId]?.[animalId];
              return (
                <div className={`ap-spotted-row${date ? ' spotted' : ''}`} key={p.parkId}>
                  <button
                    className={`ap-spotted-btn${date ? ' spotted' : ''}`}
                    onClick={() => toggleSpotting(p.parkId, animalId)}
                  >
                    {date ? '✓' : ''}
                  </button>
                  <span className="ap-spotted-park">
                    {p.parkIcon} {p.parkName}
                  </span>
                  <span className="ap-spotted-date">
                    {date ? new Date(date).toLocaleDateString() : 'Tap to mark spotted'}
                  </span>
                </div>
              );
            })}
            {anySpotted && (
              <button className="ap-link" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={handleAddPhoto}>
                &#128247; Add Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {animal.description && (
        <div className="ap-section">
          <div className="ap-section-title">📖 About</div>
          <div className="dd">{animal.description}</div>
        </div>
      )}

      {/* Quick Facts */}
      {(animal.weight || animal.length || animal.lifespan || animal.activity || animal.diet) && (
        <div className="ap-section">
          <div className="ap-section-title">📊 Quick Facts</div>
          <div className="dg">
            {animal.weight && (
              <div className="dst">
                <div className="dsl">⚖️ Weight</div>
                <div className="dsv">{animal.weight}</div>
              </div>
            )}
            {animal.length && (
              <div className="dst">
                <div className="dsl">📏 Size</div>
                <div className="dsv">{animal.length}</div>
              </div>
            )}
            {animal.lifespan && (
              <div className="dst">
                <div className="dsl">⏳ Lifespan</div>
                <div className="dsv">{animal.lifespan}</div>
              </div>
            )}
            {animal.activity && (
              <div className="dst">
                <div className="dsl">🕒 Activity</div>
                <div className="dsv">{animal.activity}</div>
              </div>
            )}
          </div>
          {animal.diet && (
            <div style={{ marginTop: 8 }}>
              <div className="dst">
                <div className="dsl">🌿 Diet</div>
                <div className="dsv">{animal.diet}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conservation Status */}
      {csStatus && csCls && (
        <div className="ap-section">
          <div className="ap-section-title">🛡️ Conservation Status</div>
          <div className="ap-cs" style={{ cursor: 'pointer' }} onClick={() => setCsOpen(!csOpen)}>
            <span className="ap-cs-label">
              IUCN Red List <span className="ap-cs-arrow">{csOpen ? '▼' : '▶'}</span>
            </span>
            <span className={`ap-cs-val ap-cs-${csCls}`}>{csStatus}</span>
          </div>
          {csOpen && (
            <div className="ap-cs-info">
              <div className="ap-cs-scale">
                {[
                  { k: 'lc', l: 'LC', f: 'Least Concern' },
                  { k: 'nt', l: 'NT', f: 'Near Threatened' },
                  { k: 'vu', l: 'VU', f: 'Vulnerable' },
                  { k: 'en', l: 'EN', f: 'Endangered' },
                  { k: 'cr', l: 'CR', f: 'Critically Endangered' },
                ].map((lv) => (
                  <div
                    key={lv.k}
                    className={`ap-cs-step ap-cs-${lv.k}${csCls === lv.k ? ' active' : ''}`}
                    title={lv.f}
                  >
                    {lv.l}
                  </div>
                ))}
              </div>
              <div className="ap-cs-desc">
                The <strong>IUCN Red List</strong> assesses the global conservation status of species.
                Categories range from <strong>Least Concern</strong> (populations stable) to{' '}
                <strong>Critically Endangered</strong> (extremely high risk of extinction in the wild).
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wikipedia excerpt */}
      <div className="ap-section">
        <div className="ap-section-title">🌐 Wikipedia</div>
        {wikiLoading ? (
          <div className="ap-wiki-loading">Loading excerpt…</div>
        ) : extract ? (
          <div className="ap-wiki">
            {extract
              .split('\n')
              .filter((p) => p.trim())
              .slice(0, 3)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        ) : (
          <div className="ap-not-spotted">No excerpt available</div>
        )}
      </div>

      {/* Available In */}
      <div className="ap-section">
        <div className="ap-section-title">🏞️ Available In</div>
        {parks.filter((p) => p.parkId !== 'wild').map((p) => (
          <div
            className="ap-park-link"
            key={p.parkId}
            onClick={() => navigate(`/park/${p.parkId}`)}
          >
            <span className="ap-park-link-icon">{p.parkIcon}</span>
            <span className="ap-park-link-name">{p.parkName}</span>
            <span className={`rb ${rarityClass(p.rarity)}`}>{p.rarity}</span>
          </div>
        ))}
      </div>
    </Container>
  );
}
