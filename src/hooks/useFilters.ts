import { useState, useCallback } from 'react';
import type { SortMode, ViewMode, SpottedFilter } from '../types/state';

export interface FilterState {
  search: string;
  category: string;
  subcategory: string;
  size: string;
  rarity: string;
  conservation: string;
  spotted: SpottedFilter;
  sort: SortMode;
  viewMode: ViewMode;
  showFilters: boolean;
  showSort: boolean;
  expandedAnimal: string | null;
  parkFilter: string;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: 'All',
  subcategory: 'All',
  size: 'All',
  rarity: 'All',
  conservation: 'All',
  spotted: false,
  sort: 'type',
  viewMode: 'list',
  showFilters: false,
  showSort: false,
  expandedAnimal: null,
  parkFilter: 'All',
};

export function useFilters(initial?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, ...initial });

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      viewMode: prev.viewMode,
    }));
  }, []);

  const hasActiveFilters =
    filters.size !== 'All' ||
    filters.rarity !== 'All' ||
    filters.conservation !== 'All' ||
    filters.subcategory !== 'All' ||
    filters.spotted !== false ||
    filters.search !== '';

  return { filters, setFilter, clearFilters, hasActiveFilters };
}
