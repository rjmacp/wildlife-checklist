import { PARKS, ANIMALS, CATEGORY_ICONS, CONSERVATION_ORDER } from '../data';
import type { SafariSession, ChecklistData } from '../types/state';
import type { Category } from '../types/animals';

export interface CategoryBreakdown {
  category: Category;
  icon: string;
  count: number;
}

export interface RareAnimalInfo {
  id: string;
  name: string;
  emoji: string;
  tip: string;
  conservationStatus: string;
  rarity: string;
}

export function getParkCategoryBreakdown(parkId: string): CategoryBreakdown[] {
  const park = PARKS.find((p) => p.id === parkId);
  if (!park) return [];

  const counts: Partial<Record<Category, number>> = {};
  for (const sp of park.species) {
    const animal = ANIMALS[sp.id];
    if (!animal) continue;
    counts[animal.category] = (counts[animal.category] ?? 0) + 1;
  }

  return (Object.entries(counts) as [Category, number][])
    .map(([category, count]) => ({
      category,
      icon: CATEGORY_ICONS[category] ?? '',
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getRareAnimals(parkId: string): RareAnimalInfo[] {
  const park = PARKS.find((p) => p.id === parkId);
  if (!park) return [];

  // Get rare/uncommon animals, prioritizing by conservation status and rarity
  const candidates = park.species
    .filter((sp) => sp.rarity === 'Rare' || sp.rarity === 'Uncommon')
    .map((sp) => {
      const animal = ANIMALS[sp.id];
      if (!animal) return null;
      return {
        id: sp.id,
        name: animal.name,
        emoji: animal.emoji,
        tip: sp.tip,
        conservationStatus: animal.conservationStatus ?? 'Least Concern',
        rarity: sp.rarity,
      };
    })
    .filter(Boolean) as RareAnimalInfo[];

  // Sort: endangered first, then rare before uncommon
  candidates.sort((a, b) => {
    const ca = CONSERVATION_ORDER[a.conservationStatus] ?? 99;
    const cb = CONSERVATION_ORDER[b.conservationStatus] ?? 99;
    if (ca !== cb) return ca - cb;
    return a.rarity === 'Rare' ? -1 : 1;
  });

  return candidates.slice(0, 5);
}

export interface SessionSpottedAnimal {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  rarity: string;
  conservationStatus: string;
}

export function getSessionSpotted(
  session: SafariSession,
  checklist: ChecklistData,
): SessionSpottedAnimal[] {
  const parkData = checklist[session.parkId] ?? {};
  const preSet = new Set(session.preSpotted);

  const newIds = Object.keys(parkData).filter((id) => !preSet.has(id));

  return newIds
    .map((id) => {
      const animal = ANIMALS[id];
      if (!animal) return null;
      const park = PARKS.find((p) => p.id === session.parkId);
      const ps = park?.species.find((sp) => sp.id === id);
      return {
        id,
        name: animal.name,
        emoji: animal.emoji,
        category: animal.category,
        rarity: ps?.rarity ?? 'Common',
        conservationStatus: animal.conservationStatus ?? 'Least Concern',
      };
    })
    .filter(Boolean) as SessionSpottedAnimal[];
}
