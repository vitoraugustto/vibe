# Changelog


## [1.0.0] - 2025-09-01
See the game changelog for details: [generic-clicker/CHANGELOG.md](./src/games/generic-clicker/CHANGELOG.md)

### Added
- Minimal game: `generic-clicker` with manifest integration and Zustand persist (`src/games/generic-clicker/`)
- Game meta: `src/games/generic-clicker/meta.ts`
- Game state: Zustand store with persist for clicker (`src/games/generic-clicker/state.ts`)
- Game UI: Clicker component with shadcn/ui and navigation (`src/games/generic-clicker/Game.tsx`)

### Changed
- Manifest: Updated to list only `generic-clicker` (`src/games/manifest.ts`)
- Button: Added `cursor-pointer` for correct pointer cursor (`src/components/ui/button.tsx`)
- Dynamic route: Fixed usage of `params.slug` with await for Next.js compliance (`src/app/games/[slug]/page.tsx`)

---

## [Initial]
- Project structure and base setup
