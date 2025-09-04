# Changelog

## [1.1.0] - 2025-09-03

See the game changelog for details: [fighter-arena/CHANGELOG.md](./src/games/fighter-arena/CHANGELOG.md)

### Added

- **Fighter Arena Game Enhancements**:
  - Structured hero class system with 9 unique classes
  - Comprehensive monster system with 41 creatures
  - Enhanced UI with detailed tooltips for fighters and monsters
  - Improved game mechanics and state management

### Changed

- Updated Fighter Arena to use ID-based systems for better organization
- Enhanced user experience with full-card tooltips and detailed information display

---

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
