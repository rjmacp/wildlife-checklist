import { describe, it, expect, beforeEach } from 'vitest';
import { loadChecklist, saveChecklist, loadTheme, saveTheme, migrateStorage } from '../../utils/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('checklist', () => {
    it('returns empty object when no data', () => {
      expect(loadChecklist()).toEqual({});
    });

    it('saves and loads checklist data', () => {
      const data = { addo: { 'african-elephant': '2024-01-01T00:00:00Z' } };
      saveChecklist(data);
      expect(loadChecklist()).toEqual(data);
    });
  });

  describe('theme', () => {
    it('returns dark by default', () => {
      expect(loadTheme()).toBe('dark');
    });

    it('saves and loads theme', () => {
      saveTheme('light');
      expect(loadTheme()).toBe('light');
    });
  });

  describe('migrateStorage', () => {
    it('migrates old format to new format', () => {
      localStorage.setItem('addo-v5', JSON.stringify({ 'African Elephant': '2024-01-01T00:00:00Z' }));
      migrateStorage();
      const data = loadChecklist();
      expect(data.addo).toBeDefined();
      expect(data.addo!['african-elephant']).toBe('2024-01-01T00:00:00Z');
      expect(localStorage.getItem('addo-v5')).toBeNull();
    });

    it('does nothing if no old data exists', () => {
      migrateStorage();
      expect(loadChecklist()).toEqual({});
    });
  });
});
