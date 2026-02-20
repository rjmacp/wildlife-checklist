import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import Header from '../components/layout/Header';
import { useSafariLog } from '../hooks/useSafariLog';
import { PARKS, ANIMALS } from '../data';
import { formatLogDate } from '../utils/time';
import { loadPhotoIndex, getPhotoBlob } from '../utils/photoStorage';
import type { SafariLogEntry, UserPhoto } from '../types/state';

function LogEntryCard({ entry }: { entry: SafariLogEntry }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const blobUrlsRef = useRef<string[]>([]);

  const park = PARKS.find((p) => p.id === entry.parkId);
  const animals = entry.spottedAnimalIds
    .map((id) => ({ id, animal: ANIMALS[id] }))
    .filter((a): a is { id: string; animal: NonNullable<typeof a.animal> } => !!a.animal);

  // Load photos lazily when expanded
  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;

    async function loadPhotos() {
      const index = loadPhotoIndex();
      const allPhotos: UserPhoto[] = [];
      for (const entries of Object.values(index)) {
        for (const photo of entries) {
          if (
            photo.parkId === entry.parkId &&
            photo.timestamp >= entry.startedAt &&
            photo.timestamp <= entry.endedAt
          ) {
            allPhotos.push(photo);
          }
        }
      }

      const urls: string[] = [];
      for (const photo of allPhotos) {
        const blob = await getPhotoBlob(photo.id);
        if (blob && !cancelled) {
          const url = URL.createObjectURL(blob);
          urls.push(url);
          blobUrlsRef.current.push(url);
        }
      }
      if (!cancelled) setPhotoUrls(urls);
    }

    loadPhotos();
    return () => {
      cancelled = true;
      for (const url of blobUrlsRef.current) URL.revokeObjectURL(url);
      blobUrlsRef.current = [];
    };
  }, [expanded, entry.parkId, entry.startedAt, entry.endedAt]);

  const rarityClass = (r: string) =>
    r === 'Common' ? 'rC' : r === 'Uncommon' ? 'rU' : 'rR';

  return (
    <div className="park-card" onClick={() => setExpanded(!expanded)}>
      <div className="park-card-top">
        <div className="park-icon">{park?.icon ?? '🏞️'}</div>
        <div className="park-info">
          <div className="park-name">{park?.name ?? entry.parkId}</div>
          <div className="park-sub">
            {formatLogDate(entry.startedAt)}
            {' · '}
            {entry.spottedAnimalIds.length} new species
          </div>
        </div>
        <span className={`park-card-chev${expanded ? ' open' : ''}`}>▼</span>
      </div>
      <div className={`park-card-expand${expanded ? ' open' : ''}`}>
        <div className="park-card-expand-inner">
          {animals.length > 0 ? (
            <div className="log-animals">
              {animals.map(({ id, animal }) => {
                const parkEntry = park?.species.find((s) => s.id === id);
                return (
                  <div
                    key={id}
                    className="log-animal-row"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/animal/${id}`);
                    }}
                  >
                    <span className="log-animal-emoji">{animal.emoji}</span>
                    <span className="log-animal-name">{animal.name}</span>
                    {parkEntry && (
                      <span className={`rb ${rarityClass(parkEntry.rarity)}`}>
                        {parkEntry.rarity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="log-no-sightings">No new species spotted</div>
          )}

          {photoUrls.length > 0 && (
            <div className="log-photos">
              <div className="log-photos-label">Photos</div>
              <div className="ap-user-photos">
                {photoUrls.map((url, i) => (
                  <img key={i} className="ap-thumb" src={url} alt="" loading="lazy" />
                ))}
              </div>
            </div>
          )}

          <button
            className="park-card-go"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/park/${entry.parkId}`);
            }}
          >
            View Park
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SafariLogPage() {
  const { log } = useSafariLog();

  const subtitle = log.length > 0
    ? `${log.length} visit${log.length === 1 ? '' : 's'} recorded`
    : 'No visits recorded yet';

  return (
    <Container>
      <Header showBack eyebrow="History" title="Safari Log" subtitle={subtitle} />

      {log.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">📖</div>
          <div className="dash-empty-title">No visits yet</div>
          <div className="dash-empty-sub">
            Complete a park visit to see your safari history here.
          </div>
        </div>
      ) : (
        <div className="park-list">
          {log.map((entry) => (
            <LogEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </Container>
  );
}
