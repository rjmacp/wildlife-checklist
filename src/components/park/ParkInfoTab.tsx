import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParkCategoryBreakdown, getRareAnimals } from '../../utils/safariHelpers';
import { loadPhotoIndex, getPhotoBlob } from '../../utils/photoStorage';
import type { Park, ResolvedAnimal } from '../../types/animals';

interface ParkInfoTabProps {
  park: Park;
  species: ResolvedAnimal[];
}

export default function ParkInfoTab({ park, species }: ParkInfoTabProps) {
  const navigate = useNavigate();
  const categoryBreakdown = useMemo(() => getParkCategoryBreakdown(park.id), [park.id]);
  const rareAnimals = useMemo(() => getRareAnimals(park.id), [park.id]);

  // Load photos for this park
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const index = loadPhotoIndex();
      const parkPhotos = Object.values(index)
        .flat()
        .filter((p) => p.parkId === park.id);
      const urls: string[] = [];
      for (const photo of parkPhotos) {
        const blob = await getPhotoBlob(photo.id);
        if (blob && !cancelled) {
          urls.push(URL.createObjectURL(blob));
        }
      }
      if (!cancelled) setPhotoUrls(urls);
    }
    load();
    return () => {
      cancelled = true;
      photoUrls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [park.id]);


  return (
    <div className="park-info">
      {/* About */}
      {park.description && (
        <div className="ap-section park-info-section">
          <div className="ap-section-title">About</div>
          <div className="dd">{park.description}</div>
        </div>
      )}

      {/* Details */}
      {(park.location || park.size || park.established) && (
        <div className="ap-section park-info-section">
          <div className="ap-section-title">Details</div>
          <div className="dg">
            {park.location && (
              <div className="dst">
                <div className="dsl">Location</div>
                <div className="dsv">{park.location}</div>
              </div>
            )}
            {park.size && (
              <div className="dst">
                <div className="dsl">Size</div>
                <div className="dsv">{park.size}</div>
              </div>
            )}
            {park.established && (
              <div className="dst">
                <div className="dsl">Established</div>
                <div className="dsv">{park.established}</div>
              </div>
            )}
            <div className="dst">
              <div className="dsl">Species</div>
              <div className="dsv">{species.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Highlights */}
      {park.highlights && park.highlights.length > 0 && (
        <div className="ap-section park-info-section">
          <div className="ap-section-title">Highlights</div>
          <div className="park-highlights">
            {park.highlights.map((h) => (
              <span key={h} className="park-highlight">{h}</span>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="ap-section park-info-section">
          <div className="ap-section-title">Category Breakdown</div>
          <div className="park-cat-list">
            {categoryBreakdown.map((cb) => (
              <div key={cb.category} className="park-cat-row">
                <span className="park-cat-icon">{cb.icon}</span>
                <span className="park-cat-name">{cb.category}</span>
                <span className="park-cat-count">{cb.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rare Species */}
      {rareAnimals.length > 0 && (
        <div className="ap-section park-info-section">
          <div className="ap-section-title">Rare Species</div>
          <div className="park-rare-list">
            {rareAnimals.map((a) => (
              <div
                key={a.id}
                className="park-rare-row"
                onClick={() => navigate(`/animal/${a.id}`)}
              >
                <span className="log-animal-emoji">{a.emoji}</span>
                <span className="log-animal-name">{a.name}</span>
                <span className={`rb r${a.rarity[0]}`}>{a.rarity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos from this Park */}
      {photoUrls.length > 0 && (
        <div className="ap-section park-info-section">
          <div className="ap-section-title">Photos from this Park</div>
          <div className="ap-user-photos">
            {photoUrls.map((url, i) => (
              <img key={i} src={url} className="ap-thumb" alt="" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
