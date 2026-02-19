import type { ResolvedAnimal, BrowseAnimal } from '../../types/animals';
import type { ViewMode } from '../../types/state';
import AnimalCard from './AnimalCard';
import EmptyState from '../common/EmptyState';

interface Props {
  animals: (ResolvedAnimal | BrowseAnimal)[];
  viewMode: ViewMode;
  expandedAnimal: string | null;
  onToggleExpand: (id: string) => void;
  isChecked: (id: string) => boolean;
  onToggleCheck: (id: string, e: React.MouseEvent) => void;
  getImage: (slug: string) => string | null;
  getCrossParkSightings: (id: string) => Array<{ parkId: string; parkName: string; date: string }>;
  getSpottedDate?: (id: string) => string | undefined;
  currentParkId?: string;
  onClearFilters?: () => void;
  browseMode?: boolean;
  parkFilter?: string;
}

export default function AnimalList({
  animals,
  viewMode,
  expandedAnimal,
  onToggleExpand,
  isChecked,
  onToggleCheck,
  getImage,
  getCrossParkSightings,
  getSpottedDate,
  currentParkId,
  onClearFilters,
  browseMode = false,
  parkFilter,
}: Props) {
  if (animals.length === 0) {
    return (
      <EmptyState
        emoji="🔭"
        message="No animals match your filters"
        action="Clear filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className={`al${viewMode === 'grid' ? ' grid' : ''}`}>
      {animals.map((a) => (
        <AnimalCard
          key={a._id}
          animal={a}
          isChecked={isChecked(a._id)}
          isExpanded={expandedAnimal === a._id}
          viewMode={viewMode}
          imageUrl={a.wikipediaSlug ? getImage(a.wikipediaSlug) : null}
          onToggleCheck={(e) => onToggleCheck(a._id, e)}
          onToggleExpand={() => onToggleExpand(a._id)}
          crossParkSightings={getCrossParkSightings(a._id)}
          currentParkId={currentParkId}
          spottedDate={getSpottedDate?.(a._id)}
          browseMode={browseMode}
          parkFilter={parkFilter}
        />
      ))}
    </div>
  );
}
