import type { ResolvedAnimal, BrowseAnimal } from '../types/animals';
import type { SortMode, ChecklistData } from '../types/state';
import { ANIMALS } from '../data/animals';
import { PARKS } from '../data/parks';
import { SIZE_ORDER, CONSERVATION_ORDER, RARITY_ORDER } from '../data/constants';

function getCrossParkLatestDate(
  animalId: string,
  checklist: ChecklistData,
): string | null {
  let latest: string | null = null;
  for (const park of PARKS) {
    const date = checklist[park.id]?.[animalId];
    if (date && (!latest || new Date(date) > new Date(latest))) {
      latest = date;
    }
  }
  return latest;
}

export function sortAnimals<T extends ResolvedAnimal | BrowseAnimal>(
  arr: T[],
  sortMode: SortMode,
  parkChecklist?: Record<string, string> | null,
  uniqueSpotted?: Set<string> | null,
  fullChecklist?: ChecklistData,
): T[] {
  const sorted = [...arr];
  sorted.sort((a, b) => {
    switch (sortMode) {
      case 'az':
        return a.name.localeCompare(b.name);
      case 'za':
        return b.name.localeCompare(a.name);
      case 'rarity':
        return (
          (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9) ||
          a.name.localeCompare(b.name)
        );
      case 'size':
        return (
          (SIZE_ORDER[a.size] ?? 9) - (SIZE_ORDER[b.size] ?? 9) || a.name.localeCompare(b.name)
        );
      case 'conservation': {
        const ca = ANIMALS[a._id]?.conservationStatus;
        const cb = ANIMALS[b._id]?.conservationStatus;
        const oa = ca ? (CONSERVATION_ORDER[ca] ?? 9) : 9;
        const ob = cb ? (CONSERVATION_ORDER[cb] ?? 9) : 9;
        return oa - ob || a.name.localeCompare(b.name);
      }
      case 'recent': {
        const da = parkChecklist?.[a._id] ?? null;
        const db = parkChecklist?.[b._id] ?? null;
        const ua =
          uniqueSpotted && !da && fullChecklist
            ? getCrossParkLatestDate(a._id, fullChecklist)
            : da;
        const ub =
          uniqueSpotted && !db && fullChecklist
            ? getCrossParkLatestDate(b._id, fullChecklist)
            : db;
        if (ua && !ub) return -1;
        if (!ua && ub) return 1;
        if (ua && ub) return new Date(ub).getTime() - new Date(ua).getTime();
        return a.name.localeCompare(b.name);
      }
    }
  });
  return sorted;
}
