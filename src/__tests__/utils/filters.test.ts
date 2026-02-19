import { describe, it, expect } from 'vitest';
import { applyAnimalFilters } from '../../utils/filters';
import type { ResolvedAnimal } from '../../types/animals';

function makeAnimal(overrides: Partial<ResolvedAnimal> & { _id: string }): ResolvedAnimal {
  return {
    name: 'Test Animal',
    category: 'Mammal',
    subcategory: 'Big 5',
    size: 'Large',
    color: 'Grey',
    emoji: '🐘',
    wikipediaSlug: '',
    description: '',
    rarity: 'Common',
    tip: '',
    ...overrides,
  };
}

const defaultFilters = {
  category: 'All',
  subcategory: 'All',
  size: 'All',
  rarity: 'All',
  conservation: 'All',
  spotted: false as const,
  search: '',
};

describe('applyAnimalFilters', () => {
  const animals = [
    makeAnimal({ _id: 'elephant', name: 'African Elephant', category: 'Mammal', rarity: 'Common', size: 'Very Large' }),
    makeAnimal({ _id: 'lion', name: 'Lion', category: 'Mammal', rarity: 'Uncommon', size: 'Large' }),
    makeAnimal({ _id: 'eagle', name: 'Fish Eagle', category: 'Bird', rarity: 'Rare', size: 'Medium' }),
  ];

  it('returns all animals with default filters', () => {
    const result = applyAnimalFilters(animals, defaultFilters, () => false);
    expect(result).toHaveLength(3);
  });

  it('filters by category', () => {
    const result = applyAnimalFilters(animals, { ...defaultFilters, category: 'Bird' }, () => false);
    expect(result).toHaveLength(1);
    expect(result[0]!._id).toBe('eagle');
  });

  it('filters by rarity', () => {
    const result = applyAnimalFilters(animals, { ...defaultFilters, rarity: 'Common' }, () => false);
    expect(result).toHaveLength(1);
    expect(result[0]!._id).toBe('elephant');
  });

  it('filters by size', () => {
    const result = applyAnimalFilters(animals, { ...defaultFilters, size: 'Large' }, () => false);
    expect(result).toHaveLength(1);
    expect(result[0]!._id).toBe('lion');
  });

  it('filters by search', () => {
    const result = applyAnimalFilters(animals, { ...defaultFilters, search: 'eagle' }, () => false);
    expect(result).toHaveLength(1);
    expect(result[0]!._id).toBe('eagle');
  });

  it('filters by spotted status', () => {
    const isSpotted = (id: string) => id === 'elephant';
    const spotted = applyAnimalFilters(animals, { ...defaultFilters, spotted: 'spotted' }, isSpotted);
    expect(spotted).toHaveLength(1);
    expect(spotted[0]!._id).toBe('elephant');

    const unspotted = applyAnimalFilters(animals, { ...defaultFilters, spotted: 'unspotted' }, isSpotted);
    expect(unspotted).toHaveLength(2);
  });
});
