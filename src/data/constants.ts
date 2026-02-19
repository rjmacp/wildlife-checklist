import type { Category, Size } from '../types/animals';

export const CATEGORY_COLORS: Record<Category, { bg: string }> = {
  Mammal: { bg: '#D4A574' },
  Bird: { bg: '#7FB3B8' },
  Reptile: { bg: '#A8B86A' },
  Amphibian: { bg: '#7BAA6E' },
  Marine: { bg: '#6A8FBF' },
  Insect: { bg: '#C4A86A' },
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Mammal: '🐾',
  Bird: '🐦',
  Reptile: '🦎',
  Amphibian: '🐸',
  Marine: '🌊',
  Insect: '🪲',
};

export const SIZES: Size[] = ['Small', 'Medium', 'Large', 'Very Large'];

export const SIZE_ORDER: Record<string, number> = {
  'Very Large': 0,
  Large: 1,
  Medium: 2,
  Small: 3,
};

export const CONSERVATION_ORDER: Record<string, number> = {
  'Critically Endangered': 0,
  Endangered: 1,
  Vulnerable: 2,
  'Near Threatened': 3,
  'Least Concern': 4,
};

export const RARITY_ORDER: Record<string, number> = {
  Rare: 0,
  Uncommon: 1,
  Common: 2,
};

export const CATEGORY_ORDER: Record<string, number> = {
  Mammal: 0,
  Bird: 1,
  Reptile: 2,
  Amphibian: 3,
  Marine: 4,
  Insect: 5,
};
