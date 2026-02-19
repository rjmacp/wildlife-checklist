import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { PARKS } from '../data/parks';
import { ANIMALS } from '../data/animals';
import { CATEGORY_COLORS } from '../data/constants';
import type { BrowseAnimal, Category } from '../types/animals';
import { useChecklist } from '../hooks/useChecklist';
import { useFilters } from '../hooks/useFilters';
import { useWikipediaImages } from '../hooks/useWikipediaImages';
import { applyAnimalFilters } from '../utils/filters';
import { sortAnimals } from '../utils/sorting';
import Container from '../components/layout/Container';
import Header from '../components/layout/Header';
import SearchBar from '../components/filters/SearchBar';
import CategoryTabs from '../components/filters/CategoryTabs';
import FilterPanel from '../components/filters/FilterPanel';
import ProgressBar from '../components/progress/ProgressBar';
import AnimalList from '../components/checklist/AnimalList';
import { openParkPicker } from '../components/common/ParkPicker';

function buildAllSpecies(): BrowseAnimal[] {
  const rarityRank: Record<string, number> = { Common: 1, Uncommon: 2, Rare: 3 };
  const map: Record<string, BrowseAnimal> = {};

  for (const p of PARKS) {
    for (const ps of p.species) {
      const base = ANIMALS[ps.id];
      if (!base) continue;
      if (!map[ps.id]) {
        map[ps.id] = {
          ...base,
          rarity: ps.rarity,
          tip: ps.tip,
          _id: ps.id,
          _parks: [{ parkId: p.id, parkName: p.name, rarity: ps.rarity, tip: ps.tip }],
        };
      } else {
        const existing = map[ps.id]!;
        existing._parks.push({ parkId: p.id, parkName: p.name, rarity: ps.rarity, tip: ps.tip });
        if ((rarityRank[ps.rarity] ?? 0) > (rarityRank[existing.rarity] ?? 0)) {
          existing.rarity = ps.rarity;
        }
      }
    }
  }
  return Object.values(map);
}

export default function BrowsePage() {
  const location = useLocation();
  const navState = location.state as { spotted?: string; category?: string } | null;
  const { checklist, getUniqueSpotted, getCrossParkSightings, toggleSpotting } = useChecklist();
  const { filters, setFilter, clearFilters, hasActiveFilters } = useFilters({
    spotted: navState?.spotted === 'spotted' ? 'spotted' : false,
    category: navState?.category ?? 'All',
  });

  const allSpecies = useMemo(() => buildAllSpecies(), []);

  // Apply park filter
  const parkFiltered = useMemo(() => {
    if (filters.parkFilter === 'All') return allSpecies;
    return allSpecies
      .filter((a) => a._parks.some((p) => p.parkId === filters.parkFilter))
      .map((a) => {
        const pp = a._parks.find((p) => p.parkId === filters.parkFilter);
        if (pp) return { ...a, rarity: pp.rarity, tip: pp.tip };
        return a;
      });
  }, [allSpecies, filters.parkFilter]);

  const uniqueSpotted = useMemo(() => getUniqueSpotted(), [getUniqueSpotted]);

  const isSpottedForFilter = (animalId: string) => {
    if (filters.parkFilter !== 'All') {
      return !!checklist[filters.parkFilter]?.[animalId];
    }
    return uniqueSpotted.has(animalId);
  };

  const filtered = useMemo(() => {
    const f = applyAnimalFilters(parkFiltered, filters, isSpottedForFilter);
    return sortAnimals(
      f,
      filters.sort,
      filters.parkFilter !== 'All' ? checklist[filters.parkFilter] ?? {} : null,
      uniqueSpotted,
      checklist,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkFiltered, filters, checklist, uniqueSpotted]);

  const categories = useMemo(() => {
    const cats = [...new Set(parkFiltered.map((a) => a.category))];
    return cats as Category[];
  }, [parkFiltered]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of parkFiltered) counts[a.category] = (counts[a.category] ?? 0) + 1;
    return counts;
  }, [parkFiltered]);

  // Subcategories
  const subcategories = useMemo(() => {
    const source =
      filters.category === 'All'
        ? parkFiltered
        : parkFiltered.filter((a) => a.category === filters.category);
    return [...new Set(source.map((a) => a.subcategory))];
  }, [parkFiltered, filters.category]);

  // Progress data
  const spottedCount = useMemo(() => {
    if (filters.parkFilter !== 'All') {
      const pk = checklist[filters.parkFilter] ?? {};
      return Object.keys(pk).filter((id) => parkFiltered.some((a) => a._id === id)).length;
    }
    return uniqueSpotted.size;
  }, [filters.parkFilter, checklist, parkFiltered, uniqueSpotted]);

  const categoryBreakdown = useMemo(() => {
    return categories.map((cat) => {
      const total = parkFiltered.filter((a) => a.category === cat).length;
      const spotted = parkFiltered.filter(
        (a) => a.category === cat && uniqueSpotted.has(a._id),
      ).length;
      return { category: cat, spotted, total };
    });
  }, [categories, parkFiltered, uniqueSpotted]);

  const rarityBreakdown = useMemo(() => {
    return (['Common', 'Uncommon', 'Rare'] as const).map((r) => ({
      rarity: r,
      total: parkFiltered.filter((a) => a.rarity === r).length,
      spotted: parkFiltered.filter((a) => a.rarity === r && uniqueSpotted.has(a._id)).length,
    }));
  }, [parkFiltered, uniqueSpotted]);

  const slugs = useMemo(() => parkFiltered.map((a) => a.wikipediaSlug).filter(Boolean), [parkFiltered]);
  const { getImage } = useWikipediaImages(slugs);

  return (
    <Container>
      <Header
        eyebrow="All Parks"
        title="All Species"
        subtitle={`${allSpecies.length} species across ${PARKS.length} parks`}
        showBack
      />

      <ProgressBar
        spotted={spottedCount}
        total={parkFiltered.length}
        categories={categoryBreakdown}
        rarities={rarityBreakdown}
      />

      <SearchBar value={filters.search} onChange={(v) => setFilter('search', v)} />

      <CategoryTabs
        categories={categories}
        active={filters.category}
        onSelect={(cat) => {
          setFilter('category', cat);
          setFilter('subcategory', 'All');
        }}
        counts={categoryCounts}
        totalCount={parkFiltered.length}
      />

      {subcategories.length > 1 && (
        <div className="cts scts">
          <button
            className={`ctb sc${filters.subcategory === 'All' ? ' a' : ''}`}
            onClick={() => setFilter('subcategory', 'All')}
          >
            All
          </button>
          {subcategories.map((sub) => {
            const cnt = parkFiltered.filter((a) => {
              if (filters.category !== 'All' && a.category !== filters.category) return false;
              return a.subcategory === sub;
            }).length;
            const clr =
              filters.category !== 'All'
                ? (CATEGORY_COLORS[filters.category as Category]?.bg ?? 'var(--gold)')
                : 'var(--gold)';
            return (
              <button
                key={sub}
                className={`ctb sc${filters.subcategory === sub ? ' a' : ''}`}
                onClick={() => setFilter('subcategory', sub)}
                style={
                  filters.subcategory === sub
                    ? { borderColor: `${clr}80`, background: `${clr}20`, color: clr }
                    : undefined
                }
              >
                {sub} ({cnt})
              </button>
            );
          })}
        </div>
      )}

      <FilterPanel
        showFilters={filters.showFilters}
        showSort={filters.showSort}
        hasActiveFilters={hasActiveFilters}
        sort={filters.sort}
        spotted={filters.spotted}
        size={filters.size}
        rarity={filters.rarity}
        conservation={filters.conservation}
        viewMode={filters.viewMode}
        filteredCount={filtered.length}
        onToggleFilters={() => {
          setFilter('showFilters', !filters.showFilters);
          setFilter('showSort', false);
        }}
        onToggleSort={() => {
          setFilter('showSort', !filters.showSort);
          setFilter('showFilters', false);
        }}
        onClear={clearFilters}
        onSetSpotted={(v) => setFilter('spotted', v)}
        onSetSize={(v) => setFilter('size', v)}
        onSetRarity={(v) => setFilter('rarity', v)}
        onSetConservation={(v) => setFilter('conservation', v)}
        onSetSort={(v) => setFilter('sort', v)}
        onSetViewMode={(v) => {
          setFilter('viewMode', v);
          setFilter('expandedAnimal', null);
        }}
      />

      <AnimalList
        animals={filtered}
        viewMode={filters.viewMode}
        expandedAnimal={filters.expandedAnimal}
        onToggleExpand={(id) =>
          setFilter('expandedAnimal', filters.expandedAnimal === id ? null : id)
        }
        isChecked={(id) => isSpottedForFilter(id)}
        onToggleCheck={(id, e) => {
          if (filters.parkFilter !== 'All') {
            toggleSpotting(filters.parkFilter, id);
          } else {
            const animal = allSpecies.find((a) => a._id === id);
            if (!animal) return;
            const sightings = getCrossParkSightings(id);
            const spottedParkIds = new Set(sightings.map((s) => s.parkId));
            const btn = (e.target as HTMLElement).closest('.ckb') as HTMLElement | null;
            const rect = btn?.getBoundingClientRect();
            openParkPicker(animal._parks, spottedParkIds, (parkId) => {
              toggleSpotting(parkId, id);
            }, rect ?? undefined);
          }
        }}
        getImage={getImage}
        getCrossParkSightings={getCrossParkSightings}
        onClearFilters={clearFilters}
        browseMode
        parkFilter={filters.parkFilter}
      />
    </Container>
  );
}
