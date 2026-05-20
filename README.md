# District Finder

District Finder is a mobile-first React prototype for a university Smart Data project. It recommends Hamburg districts based on a selected lifestyle profile, budget, and personal priorities.

The app uses local dummy district data, transparent scoring logic, result cards, saved comparisons, and a Leaflet map with highlighted recommended districts.

## Setup

### Requirements

- Node.js 20 or newer
- npm 10 or newer

### Required Packages

Runtime packages:

- `react`
- `react-dom`
- `leaflet`
- `react-leaflet`

Development and build packages:

- `typescript`
- `vite`
- `@vitejs/plugin-react`
- `@types/react`
- `@types/react-dom`
- `@types/leaflet`
- `@types/node`

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
http://127.0.0.1:5173/
```

Build the project for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Editing Dummy Data

District data lives in:

```text
src/data/districts.json
```

Each district includes rent, quality indicators, population density, a short description, and center coordinates. Quality indicators use a 0-10 scale:

- `safetyScore`
- `quietnessScore`
- `greenScore`
- `publicTransportScore`
- `schoolScore`
- `kindergartenScore`
- `nightlifeScore`

To update the prototype, edit the JSON values directly. Keep the same property names so TypeScript and the scoring function continue to work.

## Replacing Dummy Data Later

When real public Hamburg datasets are available, replace the values in `src/data/districts.json` with normalized district-level values. Recommended steps:

1. Match every public dataset row to a stable district `id`.
2. Normalize each quality indicator to the current 0-10 scale.
3. Keep rent as euros per square meter.
4. Replace center coordinates with more accurate district centers if needed.
5. For exact boundaries, add district GeoJSON and update `MapView.tsx` to render Leaflet GeoJSON layers instead of simple markers.
