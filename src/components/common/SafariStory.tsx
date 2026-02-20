import { useState, useEffect, useCallback, useRef } from 'react';
import { PARKS, CATEGORY_ICONS } from '../../data';
import type { Category } from '../../types/animals';
import type { SafariSession, ChecklistData } from '../../types/state';
import { getSessionSpotted } from '../../utils/safariHelpers';

interface StoryData {
  mode: 'summary';
  parkId: string;
  session: SafariSession;
  checklist: ChecklistData;
  onComplete: () => void;
}

let openStoryFn: ((data: StoryData) => void) | null = null;

export function openSafariStory(data: StoryData) {
  openStoryFn?.(data);
}

const SUMMARY_COUNT = 6;

export default function SafariStory() {
  const [data, setData] = useState<StoryData | null>(null);
  const [open, setOpen] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalCards = SUMMARY_COUNT;

  useEffect(() => {
    openStoryFn = (d) => {
      setData(d);
      setCardIndex(0);
      setOpen(true);
      document.body.style.overflow = 'hidden';
    };
    return () => {
      openStoryFn = null;
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = '';
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setData((prev) => {
        prev?.onComplete();
        return null;
      });
    }, 300);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (autoTimer.current) clearTimeout(autoTimer.current);
    },
    [],
  );

  const advance = useCallback(() => {
    setCardIndex((i) => {
      if (i >= totalCards - 1) {
        close();
        return i;
      }
      return i + 1;
    });
  }, [totalCards, close]);

  const goBack = useCallback(() => {
    setCardIndex((i) => Math.max(0, i - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' || e.key === ' ') advance();
      if (e.key === 'ArrowLeft') goBack();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close, advance, goBack]);

  if (!data) return null;

  return (
    <div
      className={`sf-overlay${open ? ' open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Progress bars */}
      <div className="sf-progress">
        {Array.from({ length: totalCards }).map((_, i) => (
          <div key={i} className="sf-bar">
            <div
              className={`sf-bar-fill${i < cardIndex ? ' done' : ''}${i === cardIndex ? ' active' : ''}`}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button className="sf-close" onClick={close}>&times;</button>

      {/* Navigation zones */}
      <div className="sf-nav-zones">
        <div className="sf-nav-left" onClick={goBack} />
        <div className="sf-nav-right" onClick={advance} />
      </div>

      {/* Card content */}
      <div className="sf-card-wrap" key={cardIndex}>
        <SummaryCardByIndex
          parkId={data.parkId}
          session={data.session}
          checklist={data.checklist}
          index={cardIndex}
        />
      </div>

      <div className="sf-tap">Tap to continue</div>
    </div>
  );
}

// Render individual summary card by index
function SummaryCardByIndex({
  parkId,
  session,
  checklist,
  index,
}: {
  parkId: string;
  session: SafariSession;
  checklist: ChecklistData;
  index: number;
}) {
  const park = PARKS.find((p) => p.id === parkId);
  if (!park) return null;

  const spotted = getSessionSpotted(session, checklist);
  const totalSpotted = Object.keys(checklist[parkId] ?? {}).length;

  const catCounts: Partial<Record<Category, number>> = {};
  for (const s of spotted) {
    catCounts[s.category] = (catCounts[s.category] ?? 0) + 1;
  }
  const catBreakdown = (Object.entries(catCounts) as [Category, number][])
    .map(([cat, count]) => ({ category: cat, icon: CATEGORY_ICONS[cat] ?? '', count }))
    .sort((a, b) => b.count - a.count);

  const rarityRank: Record<string, number> = { Rare: 0, Uncommon: 1, Common: 2 };
  const highlights = [...spotted]
    .sort((a, b) => (rarityRank[a.rarity] ?? 2) - (rarityRank[b.rarity] ?? 2))
    .slice(0, 5);

  const conservation = spotted.filter(
    (s) =>
      s.conservationStatus === 'Endangered' ||
      s.conservationStatus === 'Critically Endangered' ||
      s.conservationStatus === 'Vulnerable',
  );

  switch (index) {
    case 0:
      return (
        <div className="sf-card">
          <div className="sf-icon-lg">{park.icon}</div>
          <div className="sf-title">Visit Complete!</div>
          <div className="sf-subtitle">{park.name}</div>
        </div>
      );
    case 1:
      return (
        <div className="sf-card">
          <div className="sf-title">Your Sightings</div>
          {spotted.length > 0 ? (
            <>
              <div className="sf-big-num">{spotted.length}</div>
              <div className="sf-subtitle">new species spotted</div>
              {catBreakdown.length > 0 && (
                <div className="sf-cats">
                  {catBreakdown.map((c) => (
                    <div key={c.category} className="sf-cat-row">
                      <span className="sf-cat-icon">{c.icon}</span>
                      <span className="sf-cat-name">{c.category}</span>
                      <span className="sf-cat-count">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="sf-big-num">0</div>
              <div className="sf-subtitle">No new sightings this time</div>
              <div className="sf-encourage">Every visit is different — keep exploring!</div>
            </>
          )}
        </div>
      );
    case 2:
      return (
        <div className="sf-card">
          <div className="sf-title">Highlight Reel</div>
          {highlights.length > 0 ? (
            <div className="sf-animals">
              {highlights.map((a) => (
                <div key={a.id} className="sf-animal">
                  <span className="sf-animal-emoji">{a.emoji}</span>
                  <div className="sf-animal-info">
                    <span className="sf-animal-name">{a.name}</span>
                    <span className={`sf-animal-badge rb r${a.rarity[0]}`}>{a.rarity}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sf-encourage">
              The rare ones are still out there waiting for you!
            </div>
          )}
        </div>
      );
    case 3:
      return (
        <div className="sf-card">
          <div className="sf-title">Conservation Impact</div>
          {conservation.length > 0 ? (
            <>
              <div className="sf-subtitle">
                You spotted {conservation.length} conservation-priority species
              </div>
              <div className="sf-animals">
                {conservation.map((a) => (
                  <div key={a.id} className="sf-animal">
                    <span className="sf-animal-emoji">{a.emoji}</span>
                    <div className="sf-animal-info">
                      <span className="sf-animal-name">{a.name}</span>
                      <span className="sf-animal-cons">{a.conservationStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="sf-encourage">
              Keep looking — every sighting helps awareness!
            </div>
          )}
        </div>
      );
    case 4:
      return (
        <div className="sf-card">
          <div className="sf-title">Park Progress</div>
          <div className="sf-big-num">
            {totalSpotted} <span className="sf-of">of</span> {park.species.length}
          </div>
          <div className="sf-subtitle">species spotted at {park.name}</div>
          <div className="sf-progress-ring-wrap">
            <div
              className="sf-progress-fill"
              style={{
                background: `conic-gradient(var(--gold) ${(totalSpotted / park.species.length) * 360}deg, var(--w02) 0deg)`,
              }}
            />
          </div>
        </div>
      );
    case 5:
      return (
        <div className="sf-card">
          <div className="sf-icon-lg">{park.icon}</div>
          <div className="sf-title">
            {spotted.length > 0 ? 'Great Visit!' : 'Until Next Time!'}
          </div>
          <div className="sf-subtitle">
            {spotted.length > 0
              ? `You added ${spotted.length} new species to your checklist`
              : 'The wildlife will be waiting for your return'}
          </div>
        </div>
      );
    default:
      return null;
  }
}
