import type { ResolvedAnimal, BrowseAnimal, Rarity, Size, ConservationStatus } from '../types/animals';
import type { SpottedFilter } from '../types/state';
import { ANIMALS } from '../data/animals';

interface FilterOptions {
  category: string;
  subcategory: string;
  size: string;
  rarity: string;
  conservation: string;
  spotted: SpottedFilter;
  search: string;
}

export function applyAnimalFilters<T extends ResolvedAnimal | BrowseAnimal>(
  animals: T[],
  filters: FilterOptions,
  isSpotted: (animalId: string) => boolean,
): T[] {
  return animals.filter((a) => {
    if (filters.category !== 'All' && a.category !== filters.category) return false;
    if (filters.subcategory !== 'All' && a.subcategory !== filters.subcategory) return false;
    if (filters.size !== 'All' && a.size !== (filters.size as Size)) return false;
    if (filters.rarity !== 'All' && a.rarity !== (filters.rarity as Rarity)) return false;
    if (filters.conservation !== 'All') {
      const cs = ANIMALS[a._id]?.conservationStatus;
      if (cs !== (filters.conservation as ConservationStatus)) return false;
    }
    const spotted = isSpotted(a._id);
    if (filters.spotted === 'spotted' && !spotted) return false;
    if (filters.spotted === 'unspotted' && spotted) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.subcategory.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.color.toLowerCase().includes(q)
      );
    }
    return true;
  });
}
