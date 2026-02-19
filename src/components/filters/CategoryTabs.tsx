import type { Category } from '../../types/animals';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../data/constants';

interface Props {
  categories: Category[];
  active: string;
  onSelect: (cat: string) => void;
  counts: Record<string, number>;
  totalCount: number;
}

export default function CategoryTabs({ categories, active, onSelect, counts, totalCount }: Props) {
  return (
    <div className="cts" role="tablist">
      <button
        className={`ctb${active === 'All' ? ' a' : ''}`}
        onClick={() => onSelect('All')}
        role="tab"
        aria-selected={active === 'All'}
      >
        All ({totalCount})
      </button>
      {categories.map((cat) => {
        const clr = CATEGORY_COLORS[cat]?.bg ?? '#888';
        const icon = CATEGORY_ICONS[cat] ?? '';
        const isActive = active === cat;
        return (
          <button
            key={cat}
            className={`ctb${isActive ? ' a' : ''}`}
            onClick={() => onSelect(cat)}
            role="tab"
            aria-selected={isActive}
            style={
              isActive
                ? { borderColor: `${clr}80`, background: `${clr}20`, color: clr }
                : undefined
            }
          >
            {icon} {cat} ({counts[cat] ?? 0})
          </button>
        );
      })}
    </div>
  );
}
