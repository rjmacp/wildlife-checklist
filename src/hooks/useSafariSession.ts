import { useState, useCallback, useEffect } from 'react';
import type { SafariSession } from '../types/state';
import { loadSafariSession, saveSafariSession, clearSafariSession } from '../utils/safariSession';
import { loadChecklist } from '../utils/storage';
import { archiveSession } from '../utils/safariLog';

// Check if a session is from a previous calendar day
function isExpired(session: SafariSession): boolean {
  const started = new Date(session.startedAt);
  const now = new Date();
  return (
    started.getFullYear() !== now.getFullYear() ||
    started.getMonth() !== now.getMonth() ||
    started.getDate() !== now.getDate()
  );
}

function archiveCurrentSession(session: SafariSession, endedAt?: string): void {
  const checklist = loadChecklist();
  const parkData = checklist[session.parkId] ?? {};
  const preSet = new Set(session.preSpotted);
  const spottedAnimalIds = Object.keys(parkData).filter((id) => !preSet.has(id));

  archiveSession({
    id: crypto.randomUUID(),
    parkId: session.parkId,
    startedAt: session.startedAt,
    endedAt: endedAt ?? new Date().toISOString(),
    spottedAnimalIds,
  });
}

// Auto-expire on load
let currentSession: SafariSession | null = loadSafariSession();
if (currentSession && isExpired(currentSession)) {
  // Archive with endedAt = end of day of startedAt
  const started = new Date(currentSession.startedAt);
  const endOfDay = new Date(started.getFullYear(), started.getMonth(), started.getDate(), 23, 59, 59, 999);
  archiveCurrentSession(currentSession, endOfDay.toISOString());
  clearSafariSession();
  currentSession = null;
}

const listeners = new Set<(s: SafariSession | null) => void>();

function notify(s: SafariSession | null) {
  currentSession = s;
  for (const fn of listeners) fn(s);
}

export function useSafariSession() {
  const [session, setSession] = useState<SafariSession | null>(currentSession);

  useEffect(() => {
    listeners.add(setSession);
    // Sync in case it changed between render and effect
    setSession(currentSession);
    return () => { listeners.delete(setSession); };
  }, []);

  const ensureSession = useCallback((parkId: string, currentlySpotted: string[]) => {
    // Only start a session if none exists for this park
    if (currentSession?.parkId === parkId) return;
    const s: SafariSession = {
      parkId,
      preSpotted: currentlySpotted,
      startedAt: new Date().toISOString(),
    };
    saveSafariSession(s);
    notify(s);
  }, []);

  const endSession = useCallback(() => {
    if (currentSession) {
      archiveCurrentSession(currentSession);
    }
    clearSafariSession();
    notify(null);
  }, []);

  return { session, ensureSession, endSession };
}
