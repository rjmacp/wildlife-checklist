import type { SafariLog, SafariLogEntry } from '../types/state';

const KEY = 'wildlife-safari-log-v1';

export function loadSafariLog(): SafariLog {
  try {
    const d = localStorage.getItem(KEY);
    if (d) return JSON.parse(d) as SafariLog;
  } catch {
    // ignore
  }
  return [];
}

export function saveSafariLog(log: SafariLog): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(log));
  } catch {
    // ignore
  }
}

function sameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function archiveSession(entry: SafariLogEntry): void {
  const log = loadSafariLog();

  // Merge with existing same-park/same-day entry if one exists
  const idx = log.findIndex(
    (e) => e.parkId === entry.parkId && sameDay(e.startedAt, entry.startedAt),
  );

  if (idx >= 0) {
    const existing = log[idx]!;
    const unionIds = [...new Set([...existing.spottedAnimalIds, ...entry.spottedAnimalIds])];
    log[idx] = {
      id: existing.id,
      parkId: existing.parkId,
      startedAt: existing.startedAt,
      endedAt: entry.endedAt > existing.endedAt ? entry.endedAt : existing.endedAt,
      spottedAnimalIds: unionIds,
    };
  } else {
    log.unshift(entry);
  }

  saveSafariLog(log);
}
