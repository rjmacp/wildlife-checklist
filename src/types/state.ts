export type SortMode = 'type' | 'az' | 'za' | 'rarity' | 'rarity-r' | 'size' | 'size-r' | 'conservation' | 'conservation-r';
export type ViewMode = 'list' | 'grid';
export type SpottedFilter = false | 'spotted' | 'unspotted';
export type Theme = 'light' | 'dark';

/** Checklist data: { parkId: { animalId: ISO date string } } */
export type ChecklistData = Record<string, Record<string, string>>;

/** Wikipedia image cache: { wikipediaSlug: imageUrl } */
export type ImageCache = Record<string, string>;

/** A single user-uploaded photo */
export interface UserPhoto {
  id: string;          // crypto.randomUUID()
  animalId: string;
  parkId: string;
  timestamp: string;   // ISO date
  mimeType: string;
}

/** Photo index keyed by animalId */
export type PhotoIndex = Record<string, UserPhoto[]>;
