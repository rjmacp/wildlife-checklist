import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ParkPresence } from '../../types/animals';
import { PARKS } from '../../data/parks';

interface ParkPickerState {
  animalName: string;
  parks: ParkPresence[];
  spottedParkIds: Set<string>;
  onToggle: (parkId: string) => void;
  anchorRect?: DOMRect;
}

let openParkPickerFn: ((state: ParkPickerState) => void) | null = null;

export function openParkPicker(
  animalName: string,
  parks: ParkPresence[],
  spottedParkIds: Set<string>,
  onToggle: (parkId: string) => void,
  anchorRect?: DOMRect,
) {
  openParkPickerFn?.({ animalName, parks, spottedParkIds, onToggle, anchorRect });
}

const parkIconMap = Object.fromEntries(PARKS.map((p) => [p.id, p.icon]));

export default function ParkPicker() {
  const [state, setState] = useState<ParkPickerState | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    openParkPickerFn = (s) => setState({ ...s, spottedParkIds: new Set(s.spottedParkIds) });
    return () => {
      openParkPickerFn = null;
    };
  }, []);

  // Position the popover once it renders
  useEffect(() => {
    if (!state?.anchorRect || !popoverRef.current) return;
    const rect = state.anchorRect;
    const pop = popoverRef.current;
    const popH = pop.offsetHeight;
    const popW = pop.offsetWidth;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Try to place below-right of the button
    let top = rect.bottom + 6;
    let left = rect.left;

    // If it would go off the bottom, place above
    if (top + popH > vh - 12) {
      top = rect.top - popH - 6;
    }
    // If it would go off the right, shift left
    if (left + popW > vw - 12) {
      left = vw - popW - 12;
    }
    // Don't go off the left
    if (left < 12) left = 12;
    // Don't go off the top
    if (top < 12) top = 12;

    setPos({ top, left });
  }, [state]);

  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [state, close]);

  const handleToggle = useCallback(
    (parkId: string) => {
      if (!state) return;
      state.onToggle(parkId);
      setState((prev) => {
        if (!prev) return prev;
        const next = new Set(prev.spottedParkIds);
        if (next.has(parkId)) {
          next.delete(parkId);
        } else {
          next.add(parkId);
        }
        return { ...prev, spottedParkIds: next };
      });
    },
    [state],
  );

  const { wildEntry, parkEntries } = useMemo(() => {
    if (!state) return { wildEntry: null, parkEntries: [] };
    const wild = state.parks.find((p) => p.parkId === 'wild') ?? null;
    const rest = state.parks.filter((p) => p.parkId !== 'wild');
    return { wildEntry: wild, parkEntries: rest };
  }, [state]);

  const show = state !== null;
  const wildSpotted = state?.spottedParkIds.has('wild') ?? false;

  return (
    <>
      {/* Invisible backdrop to catch outside clicks */}
      {show && <div className="pp-backdrop" onClick={close} />}
      <div
        ref={popoverRef}
        className={`pp-pop${show ? ' show' : ''}`}
        style={show ? { top: pos.top, left: pos.left } : undefined}
      >
        {state && (
          <>
            <div className="pp-hdr">
              <span className="pp-title">{state.animalName}</span>
            </div>

            {/* "Spotted" row — like "Liked Songs" */}
            {wildEntry && (
              <div
                className={`pp-hero${wildSpotted ? ' spotted' : ''}`}
                onClick={() => handleToggle('wild')}
              >
                <div className={`pp-hero-check${wildSpotted ? ' spotted' : ''}`}>
                  {wildSpotted ? '✓' : ''}
                </div>
                <div className="pp-hero-info">
                  <span className="pp-hero-label">Spotted</span>
                  <span className="pp-hero-sub">In the Wild</span>
                </div>
              </div>
            )}

            {/* Park rows */}
            {parkEntries.length > 0 && (
              <>
                <div className="pp-divider" />
                {parkEntries.map((p) => {
                  const spotted = state.spottedParkIds.has(p.parkId);
                  return (
                    <div
                      key={p.parkId}
                      className={`pp-row${spotted ? ' spotted' : ''}`}
                      onClick={() => handleToggle(p.parkId)}
                    >
                      <span className="pp-row-icon">{parkIconMap[p.parkId] ?? '🏞️'}</span>
                      <span className="pp-park-name">{p.parkName}</span>
                      <div className={`pp-btn${spotted ? ' spotted' : ''}`}>
                        {spotted ? '✓' : ''}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
