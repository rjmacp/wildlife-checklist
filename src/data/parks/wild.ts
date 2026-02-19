import type { Park } from '../../types/animals';
import { ANIMALS } from '../animals';

export const PARK_WILD: Park = {
  id: 'wild',
  name: 'In the Wild',
  subtitle: 'Sightings outside of parks',
  icon: '🌍',
  species: Object.keys(ANIMALS).map((id) => ({
    id,
    rarity: 'Uncommon' as const,
    tip: 'Spotted outside a national park',
  })),
};
