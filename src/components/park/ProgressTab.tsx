import { useNavigate } from 'react-router-dom';
import ProgressRing from '../progress/ProgressRing';
import type { Category, ResolvedAnimal } from '../../types/animals';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../data/constants';
import { rarityColor, rarityClass } from '../../utils/colors';

interface CategoryBreakdown {
  category: Category;
  spotted: number;
  total: number;
}

interface RarityBreakdown {
  rarity: string;
  spotted: number;
  total: number;
}

interface Props {
  spotted: number;
  total: number;
  categories: CategoryBreakdown[];
  rarities: RarityBreakdown[];
  spottedAnimals: ResolvedAnimal[];
}

export default function ProgressTab({ spotted, total, categories, rarities, spottedAnimals }: Props) {
  const navigate = useNavigate();
  const pct = total ? (spotted / total) * 100 : 0;
  const totalColor = pct > 50 ? '#6B8F3C' : 'var(--gold)';
  return (
    <div className="progress-tab">
      {/* Section 1: Overall progress hero */}
      <div className="progress-hero">
        <div className="progress-hero-row">
          <ProgressRing spotted={spotted} total={total} size={100} color={totalColor}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>
              {spotted}/{total}
            </span>
          </ProgressRing>
          <div className="progress-hero-pct">{pct.toFixed(1)}%</div>
        </div>
      </div>

      {/* Section 2: By Type */}
      <div className="ap-section">
        <div className="ap-section-title">By Type</div>
        <div className="progress-rings-grid">
          {categories.map((c) =>
            c.total > 0 ? (
              <div
                key={c.category}
                className={`dash-ring${c.spotted === c.total && c.total > 0 ? ' complete' : ''}`}
              >
                <ProgressRing
                  spotted={c.spotted}
                  total={c.total}
                  size={56}
                  color={CATEGORY_COLORS[c.category]?.bg ?? '#888'}
                >
                  <span style={{ fontSize: 17 }}>{CATEGORY_ICONS[c.category] ?? ''}</span>
                </ProgressRing>
                <div className="dash-ring-count">
                  {c.spotted}/{c.total}
                </div>
                <div className="dash-ring-label">{c.category}</div>
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* Section 3: By Rarity */}
      <div className="ap-section">
        <div className="ap-section-title">By Rarity</div>
        <div className="progress-rings-grid">
          {rarities.map((r) =>
            r.total > 0 ? (
              <div
                key={r.rarity}
                className={`dash-ring${r.spotted === r.total && r.total > 0 ? ' complete' : ''}`}
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
                <div className="dash-ring-count">
                  {r.spotted}/{r.total}
                </div>
                <div className="dash-ring-label">{r.rarity}</div>
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* Spotted Animals */}
      {spottedAnimals.length > 0 && (
        <div className="ap-section">
          <div className="ap-section-title">Spotted Animals</div>
          <div className="park-rare-list">
            {[...spottedAnimals].sort((a, b) => a.category.localeCompare(b.category) || a.subcategory.localeCompare(b.subcategory) || a.name.localeCompare(b.name)).map((a) => (
              <div
                key={a._id}
                className="park-rare-row"
                onClick={() => navigate(`/animal/${a._id}`)}
              >
                <span className="log-animal-emoji">{a.emoji}</span>
                <span className="log-animal-name">{a.name}</span>
                <span className={`rb ${rarityClass(a.rarity)}`}>{a.rarity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
