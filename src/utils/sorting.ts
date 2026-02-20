import type { ResolvedAnimal, BrowseAnimal } from '../types/animals';
import type { SortMode } from '../types/state';
import { ANIMALS } from '../data/animals';
import { SIZE_ORDER, CONSERVATION_ORDER, RARITY_ORDER, CATEGORY_ORDER } from '../data/constants';


export function sortAnimals<T extends ResolvedAnimal | BrowseAnimal>(
  arr: T[],
  sortMode: SortMode,
): T[] {
  const sorted = [...arr];
  sorted.sort((a, b) => {
    switch (sortMode) {
      case 'type':
        return (
          (CATEGORY_ORDER[a.category] ?? 9) - (CATEGORY_ORDER[b.category] ?? 9) ||
          a.subcategory.localeCompare(b.subcategory) ||
          a.name.localeCompare(b.name)
        );
      case 'az':
        return a.name.localeCompare(b.name);
      case 'za':
        return b.name.localeCompare(a.name);
      case 'rarity':
        return (
          (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9) ||
          a.name.localeCompare(b.name)
        );
      case 'rarity-r':
        return (
          (RARITY_ORDER[b.rarity] ?? 9) - (RARITY_ORDER[a.rarity] ?? 9) ||
          a.name.localeCompare(b.name)
        );
      case 'size':
        return (
          (SIZE_ORDER[a.size] ?? 9) - (SIZE_ORDER[b.size] ?? 9) || a.name.localeCompare(b.name)
        );
      case 'size-r':
        return (
          (SIZE_ORDER[b.size] ?? 9) - (SIZE_ORDER[a.size] ?? 9) || a.name.localeCompare(b.name)
        );
      case 'conservation': {
        const ca = ANIMALS[a._id]?.conservationStatus;
        const cb = ANIMALS[b._id]?.conservationStatus;
        const oa = ca ? (CONSERVATION_ORDER[ca] ?? 9) : 9;
        const ob = cb ? (CONSERVATION_ORDER[cb] ?? 9) : 9;
        return oa - ob || a.name.localeCompare(b.name);
      }
      case 'conservation-r': {
        const ca2 = ANIMALS[a._id]?.conservationStatus;
        const cb2 = ANIMALS[b._id]?.conservationStatus;
        const oa2 = ca2 ? (CONSERVATION_ORDER[ca2] ?? 9) : 9;
        const ob2 = cb2 ? (CONSERVATION_ORDER[cb2] ?? 9) : 9;
        return ob2 - oa2 || a.name.localeCompare(b.name);
      }
    }
  });
  return sorted;
}
