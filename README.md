# Safari Spotter — Wildlife Checklist

A mobile-friendly React web app for tracking wildlife sightings across South African national parks and reserves.

## Features

- **400+ species** across mammals, birds, reptiles, amphibians, marine life, and insects
- **4 parks** — Addo Elephant National Park, Kruger National Park, Birds of Eden, and Schotia Private Game Reserve
- **Tap to spot** — mark animals as seen with automatic date tracking
- **Cross-park tracking** — see where you've spotted each animal across all parks
- **Filter & search** — by category, subcategory, size, rarity, conservation status, or free text
- **Sort** — alphabetically, by rarity, size, conservation status, or most recent sighting
- **Wikipedia photos** — automatically loaded and cached from Wikipedia's API
- **Progress tracking** — overall, per-category, and per-rarity completion stats with visual rings
- **Animal profiles** — detailed pages with facts, conservation status (IUCN scale), Wikipedia excerpts, and safari tips
- **Dark/light theme** — toggle between themes, preference saved locally
- **Grid/list view** — switch between detailed list and compact grid layouts
- **Offline-friendly** — all data bundled, sightings stored in localStorage
- **PWA-ready** — installable on mobile with manifest support

## Tech Stack

- **React 19** + **TypeScript** — component-based architecture with full type safety
- **Vite 6** — fast development server and optimized production builds
- **React Router** — hash-based routing for GitHub Pages compatibility
- **Vitest** + **React Testing Library** — unit and integration tests

## Project Structure

```
src/
  pages/              # Route-level page components
    HomePage.tsx        # Dashboard with stats, recent activity, park cards
    ParkPage.tsx        # Park checklist with filters and sorting
    BrowsePage.tsx      # Browse all species across parks
    AnimalProfilePage.tsx # Full animal profile with Wikipedia excerpt
  components/         # Reusable React components
    layout/             # Container, Header
    checklist/          # AnimalCard, AnimalList, CheckButton
    filters/            # SearchBar, CategoryTabs, FilterPanel
    progress/           # ProgressBar, ProgressRing, CategoryRings
    common/             # Lightbox, SettingsModal, ErrorBoundary, badges
  hooks/              # Custom React hooks
    useChecklist.ts     # Sighting state + localStorage persistence
    useFilters.ts       # Filter/sort/search state
    useTheme.ts         # Dark/light theme toggle
    useWikipediaImages.ts  # Image fetching + cache
    useWikipediaExtract.ts # Article intro fetching
  data/               # Static data (typed)
    animals.ts          # 413 animals with full metadata
    parks/              # 4 park files with species lists
    constants.ts        # Category colors, icons, orderings
  utils/              # Pure helper functions
  services/           # Wikipedia API integration
  styles/             # CSS (variables, global reset, component styles)
  __tests__/          # Test suite
```

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run test      # Run tests
npm run lint      # Lint source
npm run format    # Format with Prettier
```

## Deployment

Deployed via GitHub Pages at: https://rjmacp.github.io/wildlife-checklist/

The build uses `base: './'` for relative paths, compatible with any static hosting.

## Data per Species

Each animal entry includes: name, category, subcategory, size, colour, rarity, emoji icon, Wikipedia article key, safari tip, detailed description, weight, size, lifespan, activity pattern, diet, and IUCN conservation status.
