import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ParkPresence } from '../../types/animals';
import { PARKS } from '../../data/parks';

interface ParkPickerState {
  parks: ParkPresence[];
  spottedParkIds: Set<string>;
  onToggle: (parkId: string) => void;
  anchorRect?: DOMRect;
}

let openParkPickerFn: ((state: ParkPickerState) => void) | null = null;

export function openParkPicker(
  parks: ParkPresence[],
  spottedParkIds: Set<string>,
  onToggle: (parkId: string) => void,
  anchorRect?: DOMRect,
) {
  openParkPickerFn?.({ parks, spottedParkIds, onToggle, anchorRect });
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

  // Put "In the Wild" first, then the rest
  const orderedParks = useMemo(() => {
    if (!state) return [];
    const wild = state.parks.filter((p) => p.parkId === 'wild');
    const rest = state.parks.filter((p) => p.parkId !== 'wild');
    return [...wild, ...rest];
  }, [state]);

  const show = state !== null;

  return (
    <>
      {show && <div className="pp-backdrop" onClick={close} />}
      <div
        ref={popoverRef}
        className={`pp-pop${show ? ' show' : ''}`}
        style={show ? { top: pos.top, left: pos.left } : undefined}
      >
        {state && orderedParks.map((p) => {
          const spotted = state.spottedParkIds.has(p.parkId);
          return (
            <div
              key={p.parkId}
              className={`pp-row${spotted ? ' spotted' : ''}`}
              onClick={() => handleToggle(p.parkId)}
            >
              <span className="pp-row-icon">{parkIconMap[p.parkId] ?? '🏞️'}</span>
              <span className="pp-park-name">
                {p.parkId === 'wild' ? 'In the Wild' : p.parkName}
              </span>
              <div className={`pp-btn${spotted ? ' spotted' : ''}`}>
                {spotted ? '✓' : ''}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
