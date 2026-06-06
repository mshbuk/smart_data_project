# Moin

Moin is a mobile-first React prototype for a university Smart Data project. It recommends Hamburg districts based on a selected lifestyle profile, budget, and personal priorities.

The app uses local district data, transparent scoring logic, result cards, district detail views, saved comparisons, German/English UI text, a local Hamburg events module, and a Leaflet map with Hamburg district borders from GeoJSON.

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

- Demo-only login/register/guest landing page before the finder flow. It does not change recommendation behavior or create real accounts.
- Page-based flow: login/register/guest, greeting explainer, choose a profile, review or build criteria, then view recommendations.
- German-first interface with a top-right language toggle for English.
- Lifestyle profile presets for tourist/short stay, family relocation, and long-term living.
- User-defined setup with a one-question-at-a-time questionnaire, progress bar, previous/next navigation, and branching follow-up questions that adjust criteria from lifestyle answers.
- Editable priority weights with clear importance labels such as `important` and `very important`.
- Lovable-inspired white/violet visual direction with the product name `Moin`, image-led recommendation cards, and a five-tab bottom menu: Start, Karte, Events, Vergleich, Profil.
- Ranked district recommendations with 10 districts per page.
- Clickable district image areas that open in-app district detail views.
- Hamburg-only district photo pool on all 104 district result cards and detail pages instead of non-Hamburg placeholders.
- District detail pages with character traits, known-for facts, score explanations, sharing action, and external apartment-search links.
- External housing links for ImmoScout24, Immowelt, WG-Gesucht, and Kleinanzeigen from each district detail page.
- Save/favorite districts and compare saved districts side by side.
- Comparison view with best-value highlights, a saved-district radar diagram, and a priority-shape diagram based on the current preferences.
- Leaflet map with Hamburg district polygons, top-match highlighting, a current-location button, emoji landmark/local-spot markers, and district popups with save/detail actions.
- Events tab with local Hamburg event data, date/category/district filters, event detail pages, sign-up state, add-to-calendar download, route links, community comments, and a demo chat modal.
- Local demo profile page with favorites count, searched city, saved preferences, Datenschutz/Impressum notes, local data cleanup, logout, and placeholder sign-in/register actions.

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

District detail pages also derive character traits and score explanations from this local district data. Apartment previews are no longer rendered; the detail page links out to housing portals instead.

## Map Icons And POIs

Map POI data for owner-provided exact spots lives in:

```text
src/data/mapSpots.json
```

`MapView.tsx` renders POIs as emoji markers in white circular Leaflet badges. The older owner-supplied image files remain in `public/map-icons/` for traceability, but the visible map marker layer now uses emoji symbols.

Permanent Hamburg landmarks include Rathaus, Elbphilharmonie, Flughafen HAM, Universität Hamburg, HAW Hamburg, TU Hamburg, and Hauptbahnhof. District-click POIs are exact for Dulsberg, Cranz, and Finkenwerder where coordinates were provided; other districts use deterministic demo spots around the district center until a real POI dataset is added.

`src/data/mapSpots.json` currently adds exact Eimsbüttel cafes, bars, U-Bahn/S-Bahn/HVV stops, parks, and Kitas. Add future exact POIs there rather than burying them only in component code.

The optional orientation toggle layer was removed. The map now keeps the recommendation polygons, permanent Hamburg landmarks, district-click spot icons, and a clearer two-line legend for match percentages and icon meanings. The former floating "Lokale Spots" panel was removed so district clicks only show the map popup and do not cover the map with a second overlay.

## Events Data

Local demo events live in:

```text
src/data/events.json
```

The Events tab is currently a prototype dataset based on supplied Hamburg event examples. Each event includes dates, time, price, district, venue/address, coordinates, source/map links, an image URL, attendee count, and community comments. The app does not call a live events API yet; replace or augment this JSON when a stable public Hamburg event feed is selected.

## Image Sources

District card photos use Pexels-hosted Hamburg images. District cards rotate through a 20-photo Hamburg-only pool; some districts can share a photo, but non-Hamburg images should not be used for district cards. These are demo visual assets, not factual proof of a specific street. The source notes live in:

```text
evidence/image-sources/
```

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
