import type { SpottedFilter, SortMode, ViewMode } from '../../types/state';
import { SIZES } from '../../data/constants';
import { rarityColor, sizeColor, conservationColor } from '../../utils/colors';

interface Props {
  showFilters: boolean;
  showSort: boolean;
  hasActiveFilters: boolean;
  sort: SortMode;
  spotted: SpottedFilter;
  size: string;
  rarity: string;
  conservation: string;
  viewMode: ViewMode;
  filteredCount: number;
  onToggleFilters: () => void;
  onToggleSort: () => void;
  onClear: () => void;
  onSetSpotted: (v: SpottedFilter) => void;
  onSetSize: (v: string) => void;
  onSetRarity: (v: string) => void;
  onSetConservation: (v: string) => void;
  onSetSort: (v: SortMode) => void;
  onSetViewMode: (v: ViewMode) => void;
}

function FilterOption({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      className={`fo${active ? ' on' : ''}`}
      onClick={onClick}
      style={
        active && color
          ? { borderColor: `${color}60`, background: `${color}18`, color }
          : undefined
      }
    >
      {label}
    </button>
  );
}

export default function FilterPanel(props: Props) {
  const {
    showFilters,
    showSort,
    hasActiveFilters,
    sort,
    spotted,
    size,
    rarity,
    conservation,
    viewMode,
    filteredCount,
    onToggleFilters,
    onToggleSort,
    onClear,
    onSetSpotted,
    onSetSize,
    onSetRarity,
    onSetConservation,
    onSetSort,
    onSetViewMode,
  } = props;

  return (
    <>
      <div className="fb">
        <button className={`fbn${hasActiveFilters ? ' on' : ''}`} onClick={onToggleFilters}>
          ⚙ Filters{hasActiveFilters ? ' ●' : ''}
        </button>
        <button className={`fbn${sort !== 'type' ? ' on' : ''}`} onClick={onToggleSort}>
          ↕ Sort{sort !== 'type' ? ' ●' : ''}
        </button>
        {(hasActiveFilters || sort !== 'type') && (
          <button className="fbn cl" onClick={onClear}>
            Clear
          </button>
        )}
        <span className="fcn">{filteredCount} shown</span>
        <div className="vt">
          <button
            className={`vtb${viewMode === 'list' ? ' on' : ''}`}
            onClick={() => onSetViewMode('list')}
            title="List view"
          >
            ☰
          </button>
          <button
            className={`vtb${viewMode === 'grid' ? ' on' : ''}`}
            onClick={() => onSetViewMode('grid')}
            title="Grid view"
          >
            ⊞
          </button>
        </div>
      </div>

      <div className={`fp${showFilters ? ' show' : ''}`}>
        <div className="fg">
          <div className="fgl">Spotted</div>
          <div className="fos">
            {(['All', 'Spotted', 'Not Spotted'] as const).map((s) => {
              const v: SpottedFilter =
                s === 'All' ? false : s === 'Spotted' ? 'spotted' : 'unspotted';
              const clr =
                s === 'Spotted' ? '#6B8F3C' : s === 'Not Spotted' ? '#C86428' : undefined;
              return (
                <FilterOption
                  key={s}
                  label={s}
                  active={spotted === v}
                  onClick={() => onSetSpotted(v)}
                  color={spotted === v && v ? clr : undefined}
                />
              );
            })}
          </div>
        </div>
        <div className="fg">
          <div className="fgl">Size</div>
          <div className="fos">
            {['All', ...SIZES].map((s) => (
              <FilterOption
                key={s}
                label={s}
                active={size === s}
                onClick={() => onSetSize(s)}
                color={size === s && s !== 'All' ? sizeColor(s as 'Small') : undefined}
              />
            ))}
          </div>
        </div>
        <div className="fg">
          <div className="fgl">Rarity</div>
          <div className="fos">
            {['All', 'Common', 'Uncommon', 'Rare'].map((r) => (
              <FilterOption
                key={r}
                label={r}
                active={rarity === r}
                onClick={() => onSetRarity(r)}
                color={rarity === r && r !== 'All' ? rarityColor(r as 'Common') : undefined}
              />
            ))}
          </div>
        </div>
        <div className="fg">
          <div className="fgl">Conservation</div>
          <div className="fos">
            {[
              'All',
              'Least Concern',
              'Near Threatened',
              'Vulnerable',
              'Endangered',
              'Critically Endangered',
            ].map((c) => (
              <FilterOption
                key={c}
                label={c === 'Critically Endangered' ? 'Critical' : c}
                active={conservation === c}
                onClick={() => onSetConservation(c)}
                color={
                  conservation === c && c !== 'All'
                    ? conservationColor(c as 'Least Concern')
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`fp${showSort ? ' show' : ''}`}>
        <div className="fg">
          <div className="fgl">Sort by</div>
          <div className="fos">
            {(
              [
                ['type', null, 'Type'],
                ['az', 'za', 'Name'],
                ['rarity', 'rarity-r', 'Rarity'],
                ['size', 'size-r', 'Size'],
                ['conservation', 'conservation-r', 'Conservation'],
                ['recent', 'recent-r', 'Recent'],
              ] as const
            ).map(([fwd, rev, label]) => {
              const isActive = sort === fwd || (rev != null && sort === rev);
              const arrow = rev == null ? '' : sort === fwd ? ' ↑' : sort === rev ? ' ↓' : '';
              return (
                <FilterOption
                  key={fwd}
                  label={`${label}${arrow}`}
                  active={isActive}
                  onClick={() => {
                    if (rev == null) {
                      onSetSort(fwd);
                    } else {
                      onSetSort(sort === fwd ? rev : fwd);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
