import { describe, it, expect } from 'vitest';
import { ANIMALS } from '../../data/animals';
import { PARKS } from '../../data/parks';

describe('data integrity', () => {
  it('has animals in the database', () => {
    const count = Object.keys(ANIMALS).length;
    expect(count).toBeGreaterThanOrEqual(90);
  });

  it('has 5 parks', () => {
    expect(PARKS).toHaveLength(5);
  });

  it('all park species reference valid animals', () => {
    const missing: string[] = [];
    for (const park of PARKS) {
      for (const sp of park.species) {
        if (!ANIMALS[sp.id]) {
          missing.push(`${park.id}:${sp.id}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('all animals have required fields', () => {
    for (const [id, animal] of Object.entries(ANIMALS)) {
      expect(animal.name, `${id} missing name`).toBeTruthy();
      expect(animal.category, `${id} missing category`).toBeTruthy();
      expect(animal.subcategory, `${id} missing subcategory`).toBeTruthy();
      expect(animal.size, `${id} missing size`).toBeTruthy();
      expect(animal.emoji, `${id} missing emoji`).toBeTruthy();
    }
  });

  it('all parks have required fields', () => {
    for (const park of PARKS) {
      expect(park.id).toBeTruthy();
      expect(park.name).toBeTruthy();
      expect(park.icon).toBeTruthy();
      expect(park.species.length).toBeGreaterThan(0);
    }
  });

  it('all park species have valid rarity values', () => {
    const validRarities = ['Common', 'Uncommon', 'Rare'];
    for (const park of PARKS) {
      for (const sp of park.species) {
        expect(validRarities, `${park.id}:${sp.id} has invalid rarity ${sp.rarity}`).toContain(sp.rarity);
      }
    }
  });

  it('no duplicate species IDs within a park', () => {
    for (const park of PARKS) {
      const ids = park.species.map((s) => s.id);
      const unique = new Set(ids);
      expect(ids.length, `${park.id} has duplicate species`).toBe(unique.size);
    }
  });
});
