# District Finder

District Finder is a mobile-first React prototype for a university Smart Data project. It recommends Hamburg districts based on a selected lifestyle profile, budget, and personal priorities.

The app uses local dummy district data, transparent scoring logic, result cards, saved comparisons, and a Leaflet map with highlighted recommended districts.

Styling uses Tailwind CSS v4 through the official Vite plugin. The UI is built with Tailwind utility classes in the React components rather than a custom plain CSS stylesheet.

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

## GitHub Pages Deployment

This project is configured to deploy the Vite production build to GitHub Pages with GitHub Actions.

Expected public URL after GitHub Pages is enabled:

```text
https://mshbuk.github.io/smart_data_project/
```

Deployment files and settings:

- `vite.config.ts` sets `base: "/smart_data_project/"` so production assets load correctly under the repository URL.
- `.github/workflows/deploy.yml` installs dependencies, runs `npm run build`, uploads `dist/`, and deploys it to GitHub Pages.
- Every push to `main` triggers a deployment.
- You can also run the workflow manually from the GitHub `Actions` tab.

### One-Time GitHub Website Setup

After this commit is pushed:

1. Open the repository on GitHub: `mshbuk/smart_data_project`.
2. Go to `Settings`.
3. In the left sidebar, open `Pages`.
4. Under `Build and deployment`, set `Source` to `GitHub Actions`.
5. Open the `Actions` tab.
6. Select the `Deploy to GitHub Pages` workflow.
7. If it has not run automatically yet, click `Run workflow` and choose the `main` branch.
8. After the workflow succeeds, open:

```text
https://mshbuk.github.io/smart_data_project/
```

If the site shows a 404 immediately after deployment, wait a minute and refresh. GitHub Pages can take a short time to publish the first deployment.

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
