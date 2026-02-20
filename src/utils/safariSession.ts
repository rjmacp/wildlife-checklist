import type { SafariSession } from '../types/state';

const KEY = 'wildlife-safari-v1';

export function loadSafariSession(): SafariSession | null {
  try {
    const d = localStorage.getItem(KEY);
    if (d) return JSON.parse(d) as SafariSession;
  } catch {
    // ignore
  }
  return null;
}

export function saveSafariSession(session: SafariSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function clearSafariSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
