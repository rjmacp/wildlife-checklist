import type { ChecklistData, ImageCache, Theme } from '../types/state';

const CHECKLIST_KEY = 'wildlife-ck-v1';
const IMAGE_CACHE_KEY = 'addo-imgs-v2';
const THEME_KEY = 'addo-theme';
const OLD_CHECKLIST_KEY = 'addo-v5';

function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[/()''.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function migrateStorage(): void {
  try {
    const old = localStorage.getItem(OLD_CHECKLIST_KEY);
    if (!old) return;
    const oldCk = JSON.parse(old) as Record<string, string>;
    const addo: Record<string, string> = {};
    for (const [name, ts] of Object.entries(oldCk)) {
      const id = nameToId(name);
      if (id) addo[id] = ts;
    }
    const newCk: ChecklistData = { addo };
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(newCk));
    localStorage.removeItem(OLD_CHECKLIST_KEY);
  } catch (e) {
    console.log('Migration error:', e);
  }
}

export function loadChecklist(): ChecklistData {
  try {
    const d = localStorage.getItem(CHECKLIST_KEY);
    if (d) return JSON.parse(d) as ChecklistData;
  } catch {
    // ignore
  }
  return {};
}

export function saveChecklist(data: ChecklistData): void {
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadImageCache(): ImageCache {
  try {
    const d = localStorage.getItem(IMAGE_CACHE_KEY);
    if (d) return JSON.parse(d) as ImageCache;
  } catch {
    // ignore
  }
  return {};
}

export function saveImageCache(data: ImageCache): void {
  try {
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch {
    // ignore
  }
  return 'dark';
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
