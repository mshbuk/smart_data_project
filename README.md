# District Finder

District Finder is a mobile-first React prototype for a university Smart Data project. It recommends Hamburg districts based on a selected lifestyle profile, budget, and personal priorities.

The app uses local district data, transparent scoring logic, result cards, district detail views, saved comparisons, and a Leaflet map with Hamburg district borders from GeoJSON.

Styling uses Tailwind CSS v4 through the official Vite plugin. The UI is built with Tailwind utility classes in the React components rather than a custom plain CSS stylesheet.

## Live Demo

The project is published with GitHub Pages:

```text
https://mshbuk.github.io/smart_data_project/
```

## Setup

### Requirements

- Node.js 20 or newer
- npm 10 or newer

### Required Packages

Runtime packages:

- `react`
- `react-dom`
- `leaflet`
- `lucide-react`
- `react-leaflet`

Development and build packages:

- `@vitejs/plugin-react`
- `@tailwindcss/vite`
- `@types/react`
- `@types/react-dom`
- `@types/leaflet`
- `@types/node`
- `tailwindcss`
- `typescript`
- `vite`

All required packages are listed in `package.json` and installed by npm.

### Local Installation

Install dependencies from `package.json`:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the app in your browser:

```text
http://127.0.0.1:5173/smart_data_project/
```

Build the project for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The production site is deployed automatically with GitHub Actions when changes are pushed to `main`.

## Current Prototype Features

- Lifestyle profile presets for tourist/short stay, family relocation, and long-term living.
- Editable priority weights with clear importance labels such as `important` and `very important`.
- Ranked district recommendations with 10 districts per page.
- Clickable district image areas that open in-app district detail views.
- District detail pages with character traits, known-for facts, score explanations, and demo apartment previews.
- Save/favorite districts and compare saved districts side by side.
- Comparison view with best-value highlights and a priority-shape diagram based on the current preferences.
- Leaflet map with Hamburg district polygons, top-match highlighting, a current-location button, and toggleable orientation points for landmarks, parks, HVV/airport, and education/health anchors.
- Local demo profile page with favorites count, searched city, saved preferences, Datenschutz/Impressum notes, local data cleanup, and placeholder sign-in/register actions.

## Editing Dummy Data

District data lives in:

```text
src/data/districts.json
```

Border geometry lives in:

```text
src/data/districts.geojson
```

`districts.json` has one recommendation row for each district available in the GeoJSON file. Each district includes rent, quality indicators, population density, a short description, and center coordinates. Quality indicators use a 0-10 scale:

- `safetyScore`
- `quietnessScore`
- `greenScore`
- `publicTransportScore`
- `schoolScore`
- `kindergartenScore`
- `nightlifeScore`

To update the prototype, edit the JSON values directly. Keep the same property names so TypeScript and the scoring function continue to work.
Keep district names aligned with the `Stadtteil` names in `districts.geojson` so the map can match scores to borders.

District detail pages also derive demo-only apartment previews, character traits, and score explanations from this local district data. These previews are not real listings and should be replaced only when a real listing provider or dataset is available.

Source evidence for factual data updates is saved in:

```text
evidence/data-sources/
```

The sourced values and derived app scores for all 104 app districts are documented in `hamburg-district-source-metrics-2026-05-26.csv` and `score-methodology.md`. The earlier top-25 extraction snapshot is kept in the same folder for traceability.

## Replacing Dummy Data Later

When real public Hamburg datasets are available, replace the values in `src/data/districts.json` with normalized district-level values. Recommended steps:

1. Match every public dataset row to a stable district `id`.
2. Normalize each quality indicator to the current 0-10 scale.
3. Keep rent as euros per square meter.
4. Keep or replace `src/data/districts.geojson` with exact district boundaries.
5. Regenerate center coordinates if the geometry source changes.
