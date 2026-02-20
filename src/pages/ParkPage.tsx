import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/layout/Container';
import Header from '../components/layout/Header';
import SearchBar from '../components/filters/SearchBar';
import CategoryTabs from '../components/filters/CategoryTabs';
import FilterPanel from '../components/filters/FilterPanel';
import ProgressBar from '../components/progress/ProgressBar';
import AnimalList from '../components/checklist/AnimalList';
import { PARKS, ANIMALS, CATEGORY_COLORS } from '../data';
import { useChecklist } from '../hooks/useChecklist';
import { useFilters } from '../hooks/useFilters';
import { useWikipediaImages } from '../hooks/useWikipediaImages';
import { applyAnimalFilters } from '../utils/filters';
import { sortAnimals } from '../utils/sorting';
import type { ResolvedAnimal, Category } from '../types/animals';

export default function ParkPage() {
  const { parkId } = useParams<{ parkId: string }>();
  const park = PARKS.find((p) => p.id === parkId);
  const { checklist, toggleSpotting, isSpotted, getCrossParkSightings } = useChecklist();
  const { filters, setFilter, clearFilters, hasActiveFilters } = useFilters();

  // Build species list: merge park species with ANIMALS data
  const species = useMemo<ResolvedAnimal[]>(() => {
    if (!park) return [];
    return park.species
      .map((ps) => {
        const animal = ANIMALS[ps.id];
        if (!animal) return null;
        return { ...animal, rarity: ps.rarity, tip: ps.tip, _id: ps.id } as ResolvedAnimal;
      })
      .filter(Boolean) as ResolvedAnimal[];
  }, [park]);

  // Wikipedia images for all species in this park
  const slugs = useMemo(() => species.map((s) => s.wikipediaSlug).filter(Boolean), [species]);
  const { getImage } = useWikipediaImages(slugs);

  // Park-specific spotted check
  const isParkSpotted = useCallback(
    (animalId: string): boolean => {
      if (!parkId) return false;
      return isSpotted(parkId, animalId);
    },
    [parkId, isSpotted],
  );

  // Categories present in this park
  const categories = useMemo<Category[]>(() => {
    const cats = new Set<Category>();
    for (const s of species) {
      cats.add(s.category);
    }
    return ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Marine', 'Insect'].filter((c) =>
      cats.has(c as Category),
    ) as Category[];
  }, [species]);

  // Category counts (unfiltered, for the tabs)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of species) {
      counts[s.category] = (counts[s.category] ?? 0) + 1;
    }
    return counts;
  }, [species]);

  // Apply filters and sorting
  const filtered = useMemo(() => {
    const result = applyAnimalFilters(species, filters, isParkSpotted);
    return sortAnimals(result, filters.sort);
  }, [species, filters, isParkSpotted, checklist, parkId]);

  // Subcategories within the currently active category (or all)
  const subcategories = useMemo(() => {
    const relevant =
      filters.category === 'All'
        ? species
        : species.filter((s) => s.category === filters.category);
    const subs = new Set<string>();
    for (const s of relevant) {
      subs.add(s.subcategory);
    }
    return [...subs].sort();
  }, [species, filters.category]);

  const showSubcategoryTabs = subcategories.length > 1;

  // Category breakdown for progress bar
  const categoryBreakdown = useMemo(() => {
    return categories.map((cat) => {
      const catSpecies = species.filter((s) => s.category === cat);
      const spotted = catSpecies.filter((s) => isParkSpotted(s._id)).length;
      return { category: cat, spotted, total: catSpecies.length };
    });
  }, [categories, species, isParkSpotted]);

  // Rarity breakdown for progress bar
  const rarityBreakdown = useMemo(() => {
    return (['Common', 'Uncommon', 'Rare'] as const).map((rarity) => {
      const raritySpecies = species.filter((s) => s.rarity === rarity);
      const spotted = raritySpecies.filter((s) => isParkSpotted(s._id)).length;
      return { rarity, spotted, total: raritySpecies.length };
    });
  }, [species, isParkSpotted]);

  const totalSpotted = useMemo(
    () => species.filter((s) => isParkSpotted(s._id)).length,
    [species, isParkSpotted],
  );

  // Handlers
  const handleToggleCheck = useCallback(
    (animalId: string) => {
      if (parkId) toggleSpotting(parkId, animalId);
    },
    [parkId, toggleSpotting],
  );

  const handleToggleExpand = useCallback(
    (animalId: string) => {
      setFilter('expandedAnimal', filters.expandedAnimal === animalId ? null : animalId);
    },
    [setFilter, filters.expandedAnimal],
  );

  const handleCategorySelect = useCallback(
    (cat: string) => {
      setFilter('category', cat);
      setFilter('subcategory', 'All');
    },
    [setFilter],
  );

  const handleSubcategorySelect = useCallback(
    (sub: string) => {
      setFilter('subcategory', sub);
    },
    [setFilter],
  );

  const getSpottedDate = useCallback(
    (animalId: string): string | undefined => {
      if (!parkId) return undefined;
      return checklist[parkId]?.[animalId] ?? undefined;
    },
    [parkId, checklist],
  );

  if (!park) {
    return (
      <Container>
        <Header
          eyebrow="Error"
          title="Park Not Found"
          subtitle="This park does not exist"
          showBack
        />
      </Container>
    );
  }

  return (
    <Container>
      <Header
        eyebrow="South Africa"
        title={park.name}
        subtitle={park.subtitle}
        showBack
        backTo="/"
      />

      <ProgressBar
        spotted={totalSpotted}
        total={species.length}
        categories={categoryBreakdown}
        rarities={rarityBreakdown}
      />

      <SearchBar value={filters.search} onChange={(v) => setFilter('search', v)} />

      <CategoryTabs
        categories={categories}
        active={filters.category}
        onSelect={handleCategorySelect}
        counts={categoryCounts}
        totalCount={species.length}
      />

      {showSubcategoryTabs && (
        <div className="cts scts" role="tablist">
          <button
            className={`ctb sc${filters.subcategory === 'All' ? ' a' : ''}`}
            onClick={() => handleSubcategorySelect('All')}
            role="tab"
            aria-selected={filters.subcategory === 'All'}
          >
            All
          </button>
          {subcategories.map((sub) => {
            const cnt = species.filter((s) => {
              if (filters.category !== 'All' && s.category !== filters.category) return false;
              return s.subcategory === sub;
            }).length;
            const clr =
              filters.category !== 'All'
                ? (CATEGORY_COLORS[filters.category as Category]?.bg ?? 'var(--gold)')
                : 'var(--gold)';
            return (
              <button
                key={sub}
                className={`ctb sc${filters.subcategory === sub ? ' a' : ''}`}
                onClick={() => handleSubcategorySelect(sub)}
                role="tab"
                aria-selected={filters.subcategory === sub}
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
        onSetViewMode={(v) => setFilter('viewMode', v)}
      />

      <AnimalList
        animals={filtered}
        viewMode={filters.viewMode}
        expandedAnimal={filters.expandedAnimal}
        onToggleExpand={handleToggleExpand}
        isChecked={isParkSpotted}
        onToggleCheck={handleToggleCheck}
        getImage={getImage}
        getCrossParkSightings={getCrossParkSightings}
        getSpottedDate={getSpottedDate}
        currentParkId={parkId}
        onClearFilters={clearFilters}
      />
    </Container>
  );
}
