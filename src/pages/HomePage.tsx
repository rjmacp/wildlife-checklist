import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/layout/Container';
import Header from '../components/layout/Header';
import ProgressRing from '../components/progress/ProgressRing';
import { useChecklist } from '../hooks/useChecklist';
import { useSafariSession } from '../hooks/useSafariSession';
import { useWikipediaImages } from '../hooks/useWikipediaImages';
import { PARKS, PARK_WILD, ANIMALS, CATEGORY_COLORS, CATEGORY_ICONS } from '../data';
import { formatTimeAgo } from '../utils/time';
import { openSafariStory } from '../components/common/SafariStory';
import type { Category } from '../types/animals';

const ALL_CATEGORIES: Category[] = ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Marine', 'Insect'];

export default function HomePage() {
  const navigate = useNavigate();
  const [expandedPark, setExpandedPark] = useState<string | null>(null);
  const { checklist, getUniqueSpotted, getAllSightings } = useChecklist();
  const { session, endSession } = useSafariSession();

  const sessionPark = session ? PARKS.find((p) => p.id === session.parkId) : null;

  const uniqueSpotted = useMemo(() => getUniqueSpotted(), [getUniqueSpotted]);
  const allSightings = useMemo(() => getAllSightings(), [getAllSightings]);

  // Total unique animal count across all parks
  const totalUniqueAnimals = useMemo(() => {
    const ids = new Set<string>();
    for (const park of PARKS) {
      for (const sp of park.species) {
        ids.add(sp.id);
      }
    }
    return ids.size;
  }, []);

  // Parks visited (at least one sighting)
  const parksVisited = useMemo(() => {
    return PARKS.filter((p) => {
      if (p.id === PARK_WILD.id) return false;
      const pd = checklist[p.id];
      return pd && Object.keys(pd).length > 0;
    }).length;
  }, [checklist]);

  // Recent unique sightings (last 8 unique animals)
  const recentAnimals = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{ animalId: string; date: string }> = [];
    for (const s of allSightings) {
      if (!seen.has(s.animalId)) {
        seen.add(s.animalId);
        result.push({ animalId: s.animalId, date: s.date });
        if (result.length >= 8) break;
      }
    }
    return result;
  }, [allSightings]);

  // Wikipedia image slugs for recent animals
  const recentSlugs = useMemo(
    () => recentAnimals.map((r) => ANIMALS[r.animalId]?.wikipediaSlug).filter(Boolean) as string[],
    [recentAnimals],
  );
  const { getImage } = useWikipediaImages(recentSlugs);

  // Category stats for all species
  const categoryStats = useMemo(() => {
    const allIds = new Set<string>();
    for (const park of PARKS) {
      for (const sp of park.species) {
        allIds.add(sp.id);
      }
    }

    return ALL_CATEGORIES.map((cat) => {
      const catAnimals = [...allIds].filter((id) => ANIMALS[id]?.category === cat);
      const spotted = catAnimals.filter((id) => uniqueSpotted.has(id)).length;
      return { category: cat, spotted, total: catAnimals.length };
    }).filter((c) => c.total > 0);
  }, [uniqueSpotted]);

  // Per-park category stats
  const parkStats = useMemo(() => {
    return [...PARKS].sort((a, b) => a.name.localeCompare(b.name)).map((park) => {
      const catStats = ALL_CATEGORIES.map((cat) => {
        const catSpecies = park.species.filter((sp) => ANIMALS[sp.id]?.category === cat);
        const spotted = catSpecies.filter((sp) => !!checklist[park.id]?.[sp.id]).length;
        return { category: cat, spotted, total: catSpecies.length };
      }).filter((c) => c.total > 0);

      const totalSpotted = park.species.filter((sp) => !!checklist[park.id]?.[sp.id]).length;

      return { park, catStats, totalSpotted, totalSpecies: park.species.length };
    });
  }, [checklist]);

  const hasSightings = uniqueSpotted.size > 0;

  const subtitle = hasSightings
    ? `${uniqueSpotted.size} of ${totalUniqueAnimals} species spotted`
    : 'Track your wildlife sightings';

  const totalPct = totalUniqueAnimals
    ? (uniqueSpotted.size / totalUniqueAnimals) * 100
    : 0;
  const totalColor = totalPct > 50 ? '#6B8F3C' : 'var(--gold)';

  return (
    <Container>
      <Header eyebrow="South Africa" title="Wildlife Checklist" subtitle={subtitle} />

      {session && sessionPark && (
        <div className="sf-banner" onClick={() => navigate(`/park/${session.parkId}`)}>
          <span className="sf-banner-icon">{sessionPark.icon}</span>
          <div className="sf-banner-text">
            Visit in progress at <strong>{sessionPark.name}</strong>
          </div>
          <button
            className="sf-banner-finish"
            onClick={(e) => {
              e.stopPropagation();
              openSafariStory({
                mode: 'summary',
                parkId: session.parkId,
                session,
                checklist,
                onComplete: () => endSession(),
              });
            }}
          >
            End Visit
          </button>
        </div>
      )}

      {hasSightings ? (
        <>
          {/* Stats strip */}
          <div className="dash-stats">
            <div className="dash-stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/browse', { state: { spotted: 'spotted' } })}>
              <div className="dash-stat-val">{uniqueSpotted.size}</div>
              <div className="dash-stat-label">Species Spotted</div>
            </div>
            <div className="dash-stat" style={{ cursor: 'pointer' }} onClick={() => navigate('/log')}>
              <div className="dash-stat-val">
                {parksVisited}
              </div>
              <div className="dash-stat-label">Parks Visited</div>
            </div>
          </div>

          {/* Recent activity carousel */}
          <div className="dash-recent">
            <div className="dash-recent-label">Recent Activity</div>
            <div className="dash-recent-scroll">
              {recentAnimals.map((r) => {
                const animal = ANIMALS[r.animalId];
                if (!animal) return null;
                const img = animal.wikipediaSlug ? getImage(animal.wikipediaSlug) : null;
                return (
                  <div key={r.animalId} className="dash-recent-item" onClick={() => navigate(`/animal/${r.animalId}`)}>
                    {img ? (
                      <img
                        className="dash-recent-img"
                        src={img}
                        alt={animal.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="dash-recent-emoji">{animal.emoji}</div>
                    )}
                    <div className="dash-recent-name">{animal.name}</div>
                    <div className="dash-recent-time">{formatTimeAgo(r.date)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="dash-empty">
          <div className="dash-empty-icon">🌍</div>
          <div className="dash-empty-title">Your adventure begins here</div>
          <div className="dash-empty-sub">
            Visit a park below and start checking off the animals you spot!
          </div>
        </div>
      )}

      {/* All Species section */}
      <h2 className="dash-section">All Species</h2>
      <div className="dash-rings">
        <div
          className={`dash-ring${
            uniqueSpotted.size === totalUniqueAnimals && totalUniqueAnimals > 0 ? ' complete' : ''
          }`}
          onClick={() => navigate('/browse', { state: { spotted: 'spotted' } })}
          style={{ cursor: 'pointer' }}
        >
          <ProgressRing
            spotted={uniqueSpotted.size}
            total={totalUniqueAnimals}
            size={48}
            color={totalColor}
          >
            <span style={{ fontSize: 10, fontWeight: 700 }}>
              {uniqueSpotted.size}/{totalUniqueAnimals}
            </span>
          </ProgressRing>
          <div className="dash-ring-label">Total</div>
        </div>
        {categoryStats.map((c) => {
          const clr = CATEGORY_COLORS[c.category]?.bg ?? '#888';
          const icon = CATEGORY_ICONS[c.category] ?? '';
          return (
            <div
              key={c.category}
              className={`dash-ring${c.spotted === c.total && c.total > 0 ? ' complete' : ''}`}
              onClick={() =>
                navigate('/browse', { state: { spotted: 'spotted', category: c.category } })
              }
              style={{ cursor: 'pointer' }}
            >
              <ProgressRing spotted={c.spotted} total={c.total} size={48} color={clr}>
                <span style={{ fontSize: 14 }}>{icon}</span>
              </ProgressRing>
              <div className="dash-ring-count">
                {c.spotted}/{c.total}
              </div>
              <div className="dash-ring-label">{c.category}</div>
            </div>
          );
        })}
      </div>
      <button className="browse-btn" onClick={() => navigate('/browse')}>
        🔍 Browse All Species
      </button>

      {/* By Park section */}
      <div className="dash-section-row">
        <h2 className="dash-section">By Park</h2>
        <button className="dash-section-link" onClick={() => navigate('/log')}>Previous Visits →</button>
      </div>
      <div className="park-list">
        {parkStats.filter(({ park }) => park.id !== PARK_WILD.id).map(({ park, catStats, totalSpotted, totalSpecies }) => {
          const isExpanded = expandedPark === park.id;
          const pct = totalSpecies ? Math.round((totalSpotted / totalSpecies) * 100) : 0;
          return (
            <div
              key={park.id}
              className="park-card"
              onClick={() => setExpandedPark(isExpanded ? null : park.id)}
            >
              <div className="park-card-top">
                <div className="park-icon">{park.icon}</div>
                <div className="park-info">
                  <div className="park-name">{park.name}</div>
                  <div className="park-sub">
                    {totalSpotted}/{totalSpecies} spotted · {pct}%
                  </div>
                </div>
                <span className={`park-card-chev${isExpanded ? ' open' : ''}`}>▼</span>
              </div>
              <div className={`park-card-expand${isExpanded ? ' open' : ''}`}>
                <div className="park-card-expand-inner">
                  <div className="park-card-rings">
                    <div
                      className={`park-card-ring${
                        totalSpotted === totalSpecies && totalSpecies > 0 ? ' complete' : ''
                      }`}
                    >
                      <ProgressRing
                        spotted={totalSpotted}
                        total={totalSpecies}
                        size={48}
                        color={
                          totalSpecies && totalSpotted / totalSpecies > 0.5
                            ? '#6B8F3C'
                            : 'var(--gold)'
                        }
                      >
                        <span style={{ fontSize: 10, fontWeight: 700 }}>
                          {totalSpotted}/{totalSpecies}
                        </span>
                      </ProgressRing>
                      <div className="dash-ring-label">Total</div>
                    </div>
                    {catStats.map((c) => {
                      const clr = CATEGORY_COLORS[c.category]?.bg ?? '#888';
                      const icon = CATEGORY_ICONS[c.category] ?? '';
                      return (
                        <div
                          key={c.category}
                          className={`park-card-ring${
                            c.spotted === c.total && c.total > 0 ? ' complete' : ''
                          }`}
                        >
                          <ProgressRing spotted={c.spotted} total={c.total} size={48} color={clr}>
                            <span style={{ fontSize: 12 }}>{icon}</span>
                          </ProgressRing>
                          <div className="dash-ring-label">{c.spotted}/{c.total}</div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="park-card-go"
                    onClick={(e) => { e.stopPropagation(); navigate(`/park/${park.id}`); }}
                  >
                    View Park
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
