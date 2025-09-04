# Fighter Arena - Changelog

## [1.1.0] - 2025-09-03

### Added

- **Hero Class System**: Structured hero classes with specialized attributes

  - 9 unique classes: Warrior, Mage, Archer, Assassin, Paladin, Necromancer, Berserker, Monk, Druid
  - HeroClassManager utility for class management (`classes.ts`)
  - ID-based class selection system replacing string names
  - Specialized attribute bonuses and descriptions per class

- **Monster System**: Comprehensive creature system with progression

  - 41 unique monsters across 30 levels (`monsters.ts`)
  - MonsterManager utility for monster spawning and management
  - Rarity system: common, elite, berserk creatures
  - Level-based monster progression with scaling attributes
  - Detailed monster descriptions and spawn weights

- **Enhanced UI Components**:

  - Detailed tooltips for fighter and monster cards
  - Full card hover areas for better user experience
  - Comprehensive stat display in tooltips
  - Monster information with level ranges and spawn rates

- **Game Mechanics**:
  - Updated enemy spawning system using MonsterManager
  - Class-based attribute calculations
  - Improved state management with new systems integration

### Changed

- **State Management**: Refactored to use new class and monster systems

  - Enemy type updated to use monster IDs
  - Hero class system integrated with ID-based selection
  - Spawn methods updated to use MonsterManager

- **Class Selection Modal**: Simplified to use new HeroClassManager

  - Removed hardcoded class definitions
  - Integrated with structured class system
  - Improved class display and selection

- **Game Interface**: Enhanced with detailed information display
  - Tooltips now cover entire card areas
  - Comprehensive stat information for fighters and monsters
  - Improved visual feedback and user interaction

### Technical Details

- **Files Added**:

  - `src/games/fighter-arena/classes.ts` - Hero class definitions and manager
  - `src/games/fighter-arena/monsters.ts` - Monster definitions and manager
  - `src/games/fighter-arena/CHANGELOG.md` - This changelog

- **Files Modified**:
  - `src/games/fighter-arena/state.ts` - Updated to use new systems
  - `src/games/fighter-arena/Game.tsx` - Added tooltips and UI enhancements
  - `src/games/fighter-arena/components/ClassSelectionModal.tsx` - Integrated new class system

---

## [Initial]

- Base Fighter Arena game implementation
- Basic combat system and UI
- Initial class and enemy mechanics
