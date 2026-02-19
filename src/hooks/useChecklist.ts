import { useState, useCallback, useEffect } from 'react';
import type { ChecklistData } from '../types/state';
import { loadChecklist, saveChecklist, migrateStorage } from '../utils/storage';
import { PARKS } from '../data/parks';
import { ANIMALS } from '../data/animals';

// Run migration once at module load
migrateStorage();

export function useChecklist() {
  const [checklist, setChecklist] = useState<ChecklistData>(loadChecklist);

  useEffect(() => {
    saveChecklist(checklist);
  }, [checklist]);

  const toggleSpotting = useCallback((parkId: string, animalId: string) => {
    setChecklist((prev) => {
      const next = { ...prev };
      const parkData = { ...next[parkId] };
      if (parkData[animalId]) {
        delete parkData[animalId];
      } else {
        parkData[animalId] = new Date().toISOString();
      }
      next[parkId] = parkData;
      return next;
    });
  }, []);

  const isSpotted = useCallback(
    (parkId: string, animalId: string): boolean => {
      return !!checklist[parkId]?.[animalId];
    },
    [checklist],
  );

  const isSpottedAnywhere = useCallback(
    (animalId: string): boolean => {
      return PARKS.some((p) => !!checklist[p.id]?.[animalId]);
    },
    [checklist],
  );

  const getUniqueSpotted = useCallback((): Set<string> => {
    const seen = new Set<string>();
    for (const park of PARKS) {
      const parkData = checklist[park.id];
      if (parkData) {
        for (const id of Object.keys(parkData)) {
          seen.add(id);
        }
      }
    }
    return seen;
  }, [checklist]);

  const getCrossParkSightings = useCallback(
    (animalId: string) => {
      const sightings: Array<{ parkId: string; parkName: string; date: string }> = [];
      for (const p of PARKS) {
        const date = checklist[p.id]?.[animalId];
        if (date) {
          sightings.push({ parkId: p.id, parkName: p.name, date });
        }
      }
      return sightings;
    },
    [checklist],
  );

  const getAllSightings = useCallback(() => {
    const sightings: Array<{
      animalId: string;
      date: string;
      parkId: string;
      parkName: string;
    }> = [];
    for (const p of PARKS) {
      const parkData = checklist[p.id];
      if (!parkData) continue;
      for (const [animalId, date] of Object.entries(parkData)) {
        if (ANIMALS[animalId]) {
          sightings.push({ animalId, date, parkId: p.id, parkName: p.name });
        }
      }
    }
    return sightings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [checklist]);

  return {
    checklist,
    toggleSpotting,
    isSpotted,
    isSpottedAnywhere,
    getUniqueSpotted,
    getCrossParkSightings,
    getAllSightings,
  };
}
