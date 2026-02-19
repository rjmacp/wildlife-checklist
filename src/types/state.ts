export type SortMode = 'az' | 'za' | 'rarity' | 'size' | 'conservation' | 'recent';
export type ViewMode = 'list' | 'grid';
export type SpottedFilter = false | 'spotted' | 'unspotted';
export type Theme = 'light' | 'dark';

/** Checklist data: { parkId: { animalId: ISO date string } } */
export type ChecklistData = Record<string, Record<string, string>>;

/** Wikipedia image cache: { wikipediaSlug: imageUrl } */
export type ImageCache = Record<string, string>;
