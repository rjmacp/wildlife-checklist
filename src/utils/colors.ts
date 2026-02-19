import type { ConservationStatus, Rarity, Size } from '../types/animals';

export function rarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'Common':
      return '#6B8F3C';
    case 'Uncommon':
      return '#C4A86A';
    case 'Rare':
      return '#BF6A3D';
  }
}

export function sizeColor(size: Size): string {
  switch (size) {
    case 'Small':
      return '#5B9BD5';
    case 'Medium':
      return '#6B8F3C';
    case 'Large':
      return '#C4A86A';
    case 'Very Large':
      return '#BF6A3D';
  }
}

export function conservationColor(status: ConservationStatus): string {
  switch (status) {
    case 'Least Concern':
      return '#6B8F3C';
    case 'Near Threatened':
      return '#B4A03C';
    case 'Vulnerable':
      return '#C8A028';
    case 'Endangered':
      return '#C86428';
    case 'Critically Endangered':
      return '#C83232';
    case 'Data Deficient':
      return '#888';
  }
}

export function conservationClass(status?: ConservationStatus): string {
  if (!status) return 'dd';
  const map: Record<string, string> = {
    'Least Concern': 'lc',
    'Near Threatened': 'nt',
    Vulnerable: 'vu',
    Endangered: 'en',
    'Critically Endangered': 'cr',
    'Data Deficient': 'dd',
  };
  return map[status] ?? 'dd';
}

export function rarityClass(rarity: Rarity): string {
  switch (rarity) {
    case 'Common':
      return 'rC';
    case 'Uncommon':
      return 'rU';
    case 'Rare':
      return 'rR';
  }
}
