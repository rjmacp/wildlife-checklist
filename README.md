# Addo Wildlife Checklist

A mobile-friendly web app for tracking wildlife sightings at Addo Elephant National Park, South Africa.

## Features

- **98 species** across mammals, birds, reptiles, amphibians, marine life, and insects
- **Tap to spot** — mark animals as seen with automatic date tracking
- **Filter & search** — by category, subcategory, size, rarity, or free text
- **Wikipedia photos** — automatically loaded and cached from Wikipedia's API
- **Progress tracking** — overall and per-category completion stats
- **Dark/light theme** — toggle between themes, preference saved locally
- **Grid/list view** — switch between detailed list and compact grid layouts
- **Offline-friendly** — all data stored in localStorage, works without a server

## Project Structure

```
index.html          # HTML shell
css/styles.css      # All styles (dark/light themes, responsive layout)
js/data.js          # Animal database (98 species) and constants
js/app.js           # Application logic, rendering, and event handling
```

## Usage

Open `index.html` in any modern browser — no build step or server required.

Also deployed via GitHub Pages at: https://rjmacp.github.io/wildlife-checklist/

## Data per Species

Each animal entry includes: name, category, subcategory, size, colour, rarity, emoji icon, Wikipedia article key, safari tip, detailed description, weight, size, lifespan, activity pattern, and diet.
