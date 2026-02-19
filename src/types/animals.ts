export type Category = 'Mammal' | 'Bird' | 'Reptile' | 'Amphibian' | 'Marine' | 'Insect';

export type Rarity = 'Common' | 'Uncommon' | 'Rare';

export type Size = 'Small' | 'Medium' | 'Large' | 'Very Large';

export type ConservationStatus =
  | 'Least Concern'
  | 'Near Threatened'
  | 'Vulnerable'
  | 'Endangered'
  | 'Critically Endangered'
  | 'Data Deficient';

export interface Animal {
  name: string;
  category: Category;
  subcategory: string;
  size: Size;
  color: string;
  emoji: string;
  wikipediaSlug: string;
  description: string;
  weight?: string;
  length?: string;
  lifespan?: string;
  activity?: string;
  diet?: string;
  conservationStatus?: ConservationStatus;
}

export interface ParkSpeciesEntry {
  id: string;
  rarity: Rarity;
  tip: string;
}

export interface Park {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  species: ParkSpeciesEntry[];
}

/** Animal data merged with park-specific fields for rendering */
export interface ResolvedAnimal extends Animal {
  _id: string;
  rarity: Rarity;
  tip: string;
}

/** Animal data for browse page with cross-park info */
export interface BrowseAnimal extends ResolvedAnimal {
  _parks: ParkPresence[];
}

export interface ParkPresence {
  parkId: string;
  parkName: string;
  rarity: Rarity;
  tip: string;
}
