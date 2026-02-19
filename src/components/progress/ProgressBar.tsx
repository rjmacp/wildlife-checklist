import { useState } from 'react';
import ProgressRing from './ProgressRing';
import type { Category } from '../../types/animals';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../data/constants';
import { rarityColor } from '../../utils/colors';

interface CategoryBreakdown {
  category: Category;
  spotted: number;
  total: number;
}

interface Props {
  spotted: number;
  total: number;
  categories: CategoryBreakdown[];
  rarities?: Array<{ rarity: string; spotted: number; total: number }>;
}

export default function ProgressBar({ spotted, total, categories, rarities }: Props) {
  const [expanded, setExpanded] = useState(false);
  const pct = total ? (spotted / total) * 100 : 0;
  const totalColor = pct > 50 ? '#6B8F3C' : 'var(--gold)';
  const gradient =
    pct > 50
      ? 'linear-gradient(90deg,#6B8F3C,#A8CC5A)'
      : 'linear-gradient(90deg,#C4A86A,#D4B87A)';

  return (
    <div className="pb pb-exp" onClick={() => setExpanded(!expanded)}>
      <div className="pr">
        <span className="ps">
          {spotted} / {total}
        </span>
        <span className="pp">
          {pct.toFixed(1)}% spotted{' '}
          <span className="pb-arrow">{expanded ? '▲' : '▼'}</span>
        </span>
      </div>
      <div className="pt">
        <div className="pf" style={{ width: `${pct}%`, background: gradient }} />
      </div>
      {expanded && (
        <div className="pb-detail">
          <div className="pb-section-label">By Type</div>
          <div className="pb-rings">
            <div className={`pb-ring${spotted === total && total > 0 ? ' complete' : ''}`}>
              <ProgressRing spotted={spotted} total={total} size={56} color={totalColor}>
                <span style={{ fontSize: 13 }}>
                  {spotted}/{total}
                </span>
              </ProgressRing>
              <div className="dash-ring-label">Total</div>
            </div>
            {categories.map((c) =>
              c.total > 0 ? (
                <div
                  key={c.category}
                  className={`pb-ring${c.spotted === c.total && c.total > 0 ? ' complete' : ''}`}
                >
                  <ProgressRing
                    spotted={c.spotted}
                    total={c.total}
                    size={56}
                    color={CATEGORY_COLORS[c.category]?.bg ?? '#888'}
                  >
                    <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[c.category] ?? ''}</span>
                  </ProgressRing>
                  <div className="dash-ring-label">
                    {c.spotted}/{c.total}
                  </div>
                </div>
              ) : null,
            )}
          </div>
          {rarities && (
            <>
              <div className="pb-section-label">By Rarity</div>
              <div className="pb-rings">
                {rarities.map((r) =>
                  r.total > 0 ? (
                    <div
                      key={r.rarity}
                      className={`pb-ring pb-ring-lg${r.spotted === r.total && r.total > 0 ? ' complete' : ''}`}
                    >
                      <ProgressRing
                        spotted={r.spotted}
                        total={r.total}
                        size={80}
                        color={rarityColor(r.rarity as 'Common')}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: rarityColor(r.rarity as 'Common'),
                          }}
                        >
                          {r.rarity}
                        </span>
                      </ProgressRing>
                      <div className="dash-ring-label">
                        {r.spotted}/{r.total}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
