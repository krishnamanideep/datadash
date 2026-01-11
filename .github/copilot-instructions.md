This repository is a Next.js (App Router) data dashboard focused on constituency-level election and survey visualizations.

Quick orientation
- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Leaflet/React-Leaflet. See `package.json` for versions.
- **Entry points**: UI lives under `src/app` (page.tsx renders the dashboard). Reusable UI lives in `src/components`. Static/data helpers live in `src/lib` and `src/types`.
- **Data flow**: `src/lib/data.ts` exports synthetic/seed dashboard data (polling stations, GI data). UI components import from `lib` and `types` and render charts/maps.

What to change and how
- When you add UI, prefer the existing component pattern: small, focused components in `src/components` and a parent page in `src/app/page.tsx` that composes them (see `GIDashboard.tsx`, `AssemblyOverview.tsx`).
- Keep data shaping inside `src/lib` (e.g., `generateElectionData()` in `src/lib/data.ts`) instead of passing raw JSON throughout the UI.
- For assemblies metadata, use `src/lib/assemblies.ts` helpers (`getAssemblyById`). Use the existing `selectedAssembly` prop pattern on components.

Build & dev workflows
- Run locally: `npm run dev` (starts Next dev server on :3000).
- Build: `npm run build`; static export for GitHub Pages is enabled by `DEPLOY_TARGET=github-pages` and the `next.config.ts` branch that sets `output: 'export'` and `basePath`.
- Lint: `npm run lint`.

Testing and debugging notes
- There are no automated test suites present. Focus on manual verification in dev server and browser console for runtime issues.
- Map behavior: Leaflet relies on correct lat/lon fields from `src/lib/data.ts`; mismatched keys or missing coordinates will silently break markers.

Conventions and patterns
- UI files are client components (`'use client'`) when they use hooks or browser APIs (see many `src/components/*.tsx`). Keep server-safe logic in `src/lib`.
- Props: components expect typed props from `src/types/data.ts`; follow the existing shapes (e.g., `GIData`, `PollingStation`).
- Styling: Tailwind classes are used throughout — don't mix with heavy inline styles.

Integration points & deployment
- External libs: `leaflet`, `react-leaflet`, `recharts`, `mapbox-gl` and `axios` (for potential API calls). There is no backend server in this repo — data is seeded locally.
- GitHub Pages: set `DEPLOY_TARGET=github-pages` in CI or local env to produce a static export (see `next.config.ts` and `.github/workflows/*` for deployment flows).

Files to inspect for context
- `README.md` (project overview)
- `package.json` (scripts & deps)
- `next.config.ts` (github-pages export behavior)
- `src/app/page.tsx`, `src/components/*`, `src/lib/data.ts`, `src/lib/assemblies.ts`, `src/types/data.ts`

When opening PRs
- Keep changes small and focused to individual components or data helpers.
- If adding data fields, update the TypeScript types in `src/types/data.ts` and all components consuming those fields.

Examples (copy/paste patterns)
- Select assembly pattern: `const [selectedAssembly, setSelectedAssembly] = useState('1')` and pass `selectedAssembly` to child components.
- Data provider: `import { generateElectionData } from '@/lib/data'` and destructure `{ pollingStations, giData }` for feeds.

If anything is unclear
- Ask for the specific component and which data fields it should accept. I will point to the exact file and lines to edit.

Please review — want me to (a) run a local build and verify the dashboard, (b) add a short examples section with exact prop types and lines, or (c) iterate changes to wording?
