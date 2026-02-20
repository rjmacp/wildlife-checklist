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

/** An active safari session at a park */
export interface SafariSession {
  parkId: string;
  preSpotted: string[];    // animal IDs spotted in this park before session started
  startedAt: string;       // ISO date (for display only)
}

/** A completed safari visit entry */
export interface SafariLogEntry {
  id: string;                 // crypto.randomUUID()
  parkId: string;
  startedAt: string;          // ISO date
  endedAt: string;            // ISO date
  spottedAnimalIds: string[]; // animal IDs spotted NEW during this session
}
export type SafariLog = SafariLogEntry[];
