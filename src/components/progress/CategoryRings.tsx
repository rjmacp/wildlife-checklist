import ProgressRing from './ProgressRing';
import type { Category } from '../../types/animals';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../data/constants';

interface RingData {
  key: string;
  label: string;
  icon?: string;
  spotted: number;
  total: number;
  color: string;
  onClick?: () => void;
}

interface Props {
  rings: RingData[];
}

export function CategoryRingsRow({ rings }: Props) {
  return (
    <div className="dash-rings">
      {rings.map((ring) => {
        const complete = ring.spotted === ring.total && ring.total > 0;
        return (
          <div
            key={ring.key}
            className={`dash-ring${complete ? ' complete' : ''}`}
            style={ring.onClick ? { cursor: 'pointer' } : undefined}
            onClick={ring.onClick}
          >
            <ProgressRing spotted={ring.spotted} total={ring.total} size={52} color={ring.color}>
              {ring.icon ?? (
                <span style={{ fontSize: 11 }}>
                  {ring.spotted}/{ring.total}
                </span>
              )}
            </ProgressRing>
            <div className="dash-ring-count">
              {ring.icon ? `${ring.spotted}/${ring.total}` : ''}
            </div>
            <div className="dash-ring-label">{ring.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function buildCategoryRings(
  catMap: Record<string, { spotted: Set<string>; total: Set<string> }>,
  onCategoryClick?: (cat: string) => void,
): RingData[] {
  const cats = Object.keys(catMap).filter((c) => catMap[c]!.total.size > 0);
  return cats.map((cat) => {
    const data = catMap[cat]!;
    return {
      key: cat,
      label: cat,
      icon: CATEGORY_ICONS[cat as Category] ?? '',
      spotted: data.spotted.size,
      total: data.total.size,
      color: CATEGORY_COLORS[cat as Category]?.bg ?? 'var(--gold)',
      onClick: onCategoryClick ? () => onCategoryClick(cat) : undefined,
    };
  });
}
