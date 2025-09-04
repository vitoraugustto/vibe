export type MonsterId =
  | "wolf"
  | "goblin"
  | "spider"
  | "slime"
  | "bat"
  | "orc"
  | "skeleton"
  | "zombie"
  | "troll"
  | "dragon"
  | "demon"
  | "ghost"
  | "minotaur"
  | "hydra"
  | "phoenix"
  | "kraken"
  | "lich"
  | "vampire"
  | "werewolf"
  | "golem"
  | "scorpion"
  | "gargoyle"
  | "imp"
  | "wraith"
  | "chimera"
  | "basilisk"
  | "banshee"
  | "elemental"
  | "manticore"
  | "behemoth"
  | "leviathan"
  | "titan"
  | "ancient_dragon"
  | "void_lord"
  | "necromancer"
  | "djinn"
  | "colossus"
  | "serpent"
  | "harpy"
  | "cyclops";

export type Rarity = "common" | "elite" | "berserk";

export interface MonsterClass {
  id: MonsterId;
  name: string;
  emoji: string;
  description: string;
  baseHp: number;
  baseDamage: number;
  baseSpeed: number; // multiplicador de velocidade (menor = mais rápido)
  rarityWeights: {
    common: number;
    elite: number;
    berserk: number;
  };
  levelRange: {
    min: number;
    max: number;
  };
}

export const MONSTER_CLASSES: Record<MonsterId, MonsterClass> = {
  // Monstros Comuns (Nível 1-3)
  wolf: {
    id: "wolf",
    name: "Lobo",
    emoji: "🐺",
    description: "Predador selvagem com ataques rápidos",
    baseHp: 35,
    baseDamage: 8,
    baseSpeed: 0.9,
    rarityWeights: { common: 85, elite: 12, berserk: 3 },
    levelRange: { min: 1, max: 3 },
  },
  goblin: {
    id: "goblin",
    name: "Goblin",
    emoji: "👾",
    description: "Criatura pequena mas astuta",
    baseHp: 30,
    baseDamage: 6,
    baseSpeed: 0.8,
    rarityWeights: { common: 90, elite: 8, berserk: 2 },
    levelRange: { min: 1, max: 2 },
  },
  spider: {
    id: "spider",
    name: "Aranha",
    emoji: "🕷️",
    description: "Aranha venenosa com ataques precisos",
    baseHp: 25,
    baseDamage: 10,
    baseSpeed: 0.7,
    rarityWeights: { common: 80, elite: 15, berserk: 5 },
    levelRange: { min: 1, max: 4 },
  },
  slime: {
    id: "slime",
    name: "Slime",
    emoji: "🟢",
    description: "Gosma resistente que absorve dano",
    baseHp: 50,
    baseDamage: 4,
    baseSpeed: 1.3,
    rarityWeights: { common: 95, elite: 4, berserk: 1 },
    levelRange: { min: 1, max: 2 },
  },
  bat: {
    id: "bat",
    name: "Morcego",
    emoji: "🦇",
    description: "Criatura voadora extremamente rápida",
    baseHp: 20,
    baseDamage: 5,
    baseSpeed: 0.5,
    rarityWeights: { common: 88, elite: 10, berserk: 2 },
    levelRange: { min: 1, max: 3 },
  },

  // Monstros Intermediários (Nível 2-5)
  orc: {
    id: "orc",
    name: "Orc",
    emoji: "👹",
    description: "Guerreiro brutal com força devastadora",
    baseHp: 60,
    baseDamage: 12,
    baseSpeed: 1.1,
    rarityWeights: { common: 70, elite: 25, berserk: 5 },
    levelRange: { min: 2, max: 5 },
  },
  skeleton: {
    id: "skeleton",
    name: "Esqueleto",
    emoji: "💀",
    description: "Morto-vivo que não sente dor",
    baseHp: 45,
    baseDamage: 9,
    baseSpeed: 1.0,
    rarityWeights: { common: 75, elite: 20, berserk: 5 },
    levelRange: { min: 2, max: 4 },
  },
  zombie: {
    id: "zombie",
    name: "Zumbi",
    emoji: "🧟",
    description: "Morto-vivo lento mas resistente",
    baseHp: 70,
    baseDamage: 7,
    baseSpeed: 1.4,
    rarityWeights: { common: 80, elite: 15, berserk: 5 },
    levelRange: { min: 2, max: 4 },
  },
  ghost: {
    id: "ghost",
    name: "Fantasma",
    emoji: "👻",
    description: "Espírito etéreo com ataques místicos",
    baseHp: 40,
    baseDamage: 11,
    baseSpeed: 0.8,
    rarityWeights: { common: 65, elite: 25, berserk: 10 },
    levelRange: { min: 3, max: 6 },
  },

  // Monstros Avançados (Nível 4-8)
  troll: {
    id: "troll",
    name: "Troll",
    emoji: "🧌",
    description: "Gigante regenerativo com força colossal",
    baseHp: 120,
    baseDamage: 18,
    baseSpeed: 1.3,
    rarityWeights: { common: 50, elite: 35, berserk: 15 },
    levelRange: { min: 4, max: 7 },
  },
  minotaur: {
    id: "minotaur",
    name: "Minotauro",
    emoji: "🐂",
    description: "Bestia híbrida com chifres letais",
    baseHp: 90,
    baseDamage: 16,
    baseSpeed: 0.9,
    rarityWeights: { common: 45, elite: 40, berserk: 15 },
    levelRange: { min: 4, max: 8 },
  },
  vampire: {
    id: "vampire",
    name: "Vampiro",
    emoji: "🧛",
    description: "Morto-vivo nobre que drena vida",
    baseHp: 80,
    baseDamage: 14,
    baseSpeed: 0.7,
    rarityWeights: { common: 40, elite: 45, berserk: 15 },
    levelRange: { min: 5, max: 8 },
  },
  werewolf: {
    id: "werewolf",
    name: "Lobisomem",
    emoji: "🐺",
    description: "Predador transformado pela lua cheia",
    baseHp: 85,
    baseDamage: 15,
    baseSpeed: 0.6,
    rarityWeights: { common: 35, elite: 45, berserk: 20 },
    levelRange: { min: 5, max: 8 },
  },

  // Monstros Épicos (Nível 6-10)
  dragon: {
    id: "dragon",
    name: "Dragão",
    emoji: "🐉",
    description: "Lenda antiga com poder de fogo devastador",
    baseHp: 180,
    baseDamage: 25,
    baseSpeed: 1.0,
    rarityWeights: { common: 20, elite: 50, berserk: 30 },
    levelRange: { min: 6, max: 10 },
  },
  demon: {
    id: "demon",
    name: "Demônio",
    emoji: "😈",
    description: "Entidade infernal com poderes sombrios",
    baseHp: 150,
    baseDamage: 22,
    baseSpeed: 0.8,
    rarityWeights: { common: 25, elite: 45, berserk: 30 },
    levelRange: { min: 6, max: 10 },
  },
  hydra: {
    id: "hydra",
    name: "Hidra",
    emoji: "🐍",
    description: "Serpente multicéfala que regenera rapidamente",
    baseHp: 200,
    baseDamage: 20,
    baseSpeed: 1.1,
    rarityWeights: { common: 15, elite: 55, berserk: 30 },
    levelRange: { min: 7, max: 10 },
  },
  golem: {
    id: "golem",
    name: "Golem",
    emoji: "🗿",
    description: "Construto de pedra com defesa impenetrável",
    baseHp: 250,
    baseDamage: 15,
    baseSpeed: 1.6,
    rarityWeights: { common: 30, elite: 50, berserk: 20 },
    levelRange: { min: 6, max: 9 },
  },

  // Monstros Lendários (Nível 8+)
  phoenix: {
    id: "phoenix",
    name: "Fênix",
    emoji: "🔥",
    description: "Ave imortal que renasce das cinzas",
    baseHp: 160,
    baseDamage: 28,
    baseSpeed: 0.6,
    rarityWeights: { common: 10, elite: 40, berserk: 50 },
    levelRange: { min: 8, max: 12 },
  },
  kraken: {
    id: "kraken",
    name: "Kraken",
    emoji: "🐙",
    description: "Leviatã dos abismos com tentáculos devastadores",
    baseHp: 300,
    baseDamage: 30,
    baseSpeed: 1.2,
    rarityWeights: { common: 5, elite: 35, berserk: 60 },
    levelRange: { min: 9, max: 12 },
  },
  lich: {
    id: "lich",
    name: "Lich",
    emoji: "☠️",
    description: "Arquimago morto-vivo mestre da necromancia",
    baseHp: 220,
    baseDamage: 35,
    baseSpeed: 1.0,
    rarityWeights: { common: 8, elite: 32, berserk: 60 },
    levelRange: { min: 10, max: 15 },
  },

  // Monstros Adicionais Comuns/Intermediários
  scorpion: {
    id: "scorpion",
    name: "Escorpião",
    emoji: "🦂",
    description: "Artrópode venenoso com cauda letal",
    baseHp: 30,
    baseDamage: 12,
    baseSpeed: 0.8,
    rarityWeights: { common: 75, elite: 20, berserk: 5 },
    levelRange: { min: 2, max: 5 },
  },
  gargoyle: {
    id: "gargoyle",
    name: "Gárgula",
    emoji: "🗿",
    description: "Guardião de pedra que ganha vida",
    baseHp: 80,
    baseDamage: 13,
    baseSpeed: 1.2,
    rarityWeights: { common: 60, elite: 30, berserk: 10 },
    levelRange: { min: 3, max: 6 },
  },
  imp: {
    id: "imp",
    name: "Diabrete",
    emoji: "👺",
    description: "Demônio menor astuto e veloz",
    baseHp: 35,
    baseDamage: 9,
    baseSpeed: 0.6,
    rarityWeights: { common: 70, elite: 25, berserk: 5 },
    levelRange: { min: 2, max: 4 },
  },
  serpent: {
    id: "serpent",
    name: "Serpente",
    emoji: "🐍",
    description: "Cobra gigante com veneno mortal",
    baseHp: 55,
    baseDamage: 11,
    baseSpeed: 0.7,
    rarityWeights: { common: 65, elite: 25, berserk: 10 },
    levelRange: { min: 3, max: 6 },
  },
  harpy: {
    id: "harpy",
    name: "Harpia",
    emoji: "🦅",
    description: "Criatura alada com garras afiadas",
    baseHp: 45,
    baseDamage: 14,
    baseSpeed: 0.5,
    rarityWeights: { common: 55, elite: 35, berserk: 10 },
    levelRange: { min: 4, max: 7 },
  },

  // Monstros Avançados Adicionais
  wraith: {
    id: "wraith",
    name: "Espectro",
    emoji: "👤",
    description: "Alma atormentada que drena energia vital",
    baseHp: 65,
    baseDamage: 17,
    baseSpeed: 0.6,
    rarityWeights: { common: 40, elite: 45, berserk: 15 },
    levelRange: { min: 5, max: 8 },
  },
  basilisk: {
    id: "basilisk",
    name: "Basilisco",
    emoji: "🐉",
    description: "Rei das serpentes com olhar petrificante",
    baseHp: 110,
    baseDamage: 19,
    baseSpeed: 0.9,
    rarityWeights: { common: 35, elite: 45, berserk: 20 },
    levelRange: { min: 6, max: 9 },
  },
  banshee: {
    id: "banshee",
    name: "Banshee",
    emoji: "👻",
    description: "Espírito lamentoso com grito devastador",
    baseHp: 75,
    baseDamage: 21,
    baseSpeed: 0.7,
    rarityWeights: { common: 30, elite: 50, berserk: 20 },
    levelRange: { min: 6, max: 9 },
  },
  elemental: {
    id: "elemental",
    name: "Elemental",
    emoji: "🌪️",
    description: "Força da natureza incarnada",
    baseHp: 120,
    baseDamage: 18,
    baseSpeed: 0.8,
    rarityWeights: { common: 45, elite: 40, berserk: 15 },
    levelRange: { min: 5, max: 8 },
  },
  cyclops: {
    id: "cyclops",
    name: "Ciclope",
    emoji: "👁️",
    description: "Gigante de um olho só com força colossal",
    baseHp: 150,
    baseDamage: 22,
    baseSpeed: 1.4,
    rarityWeights: { common: 40, elite: 45, berserk: 15 },
    levelRange: { min: 6, max: 9 },
  },

  // Monstros Épicos Adicionais
  chimera: {
    id: "chimera",
    name: "Quimera",
    emoji: "🐲",
    description: "Besta tricéfala cuspidora de fogo",
    baseHp: 190,
    baseDamage: 26,
    baseSpeed: 0.9,
    rarityWeights: { common: 20, elite: 50, berserk: 30 },
    levelRange: { min: 7, max: 11 },
  },
  manticore: {
    id: "manticore",
    name: "Mantícora",
    emoji: "🦁",
    description: "Leão alado com cauda de escorpião",
    baseHp: 170,
    baseDamage: 24,
    baseSpeed: 0.8,
    rarityWeights: { common: 25, elite: 50, berserk: 25 },
    levelRange: { min: 7, max: 10 },
  },
  djinn: {
    id: "djinn",
    name: "Djinn",
    emoji: "🧞",
    description: "Gênio poderoso mestre da magia",
    baseHp: 140,
    baseDamage: 28,
    baseSpeed: 0.7,
    rarityWeights: { common: 15, elite: 55, berserk: 30 },
    levelRange: { min: 8, max: 11 },
  },
  necromancer: {
    id: "necromancer",
    name: "Necromante",
    emoji: "🧙",
    description: "Mago sombrio que controla os mortos",
    baseHp: 160,
    baseDamage: 30,
    baseSpeed: 1.1,
    rarityWeights: { common: 20, elite: 45, berserk: 35 },
    levelRange: { min: 8, max: 12 },
  },

  // Monstros Lendários Adicionais
  behemoth: {
    id: "behemoth",
    name: "Behemoth",
    emoji: "🦣",
    description: "Colosso primitivo de poder incomensurável",
    baseHp: 350,
    baseDamage: 32,
    baseSpeed: 1.5,
    rarityWeights: { common: 8, elite: 35, berserk: 57 },
    levelRange: { min: 10, max: 15 },
  },
  leviathan: {
    id: "leviathan",
    name: "Leviatã",
    emoji: "🐋",
    description: "Monstro marinho das profundezas abissais",
    baseHp: 400,
    baseDamage: 35,
    baseSpeed: 1.3,
    rarityWeights: { common: 5, elite: 30, berserk: 65 },
    levelRange: { min: 11, max: 16 },
  },
  titan: {
    id: "titan",
    name: "Titã",
    emoji: "⛰️",
    description: "Gigante ancestral que move montanhas",
    baseHp: 450,
    baseDamage: 38,
    baseSpeed: 1.7,
    rarityWeights: { common: 3, elite: 25, berserk: 72 },
    levelRange: { min: 12, max: 18 },
  },
  ancient_dragon: {
    id: "ancient_dragon",
    name: "Dragão Ancestral",
    emoji: "🐲",
    description: "Dragão milenar de sabedoria e poder supremos",
    baseHp: 500,
    baseDamage: 42,
    baseSpeed: 0.9,
    rarityWeights: { common: 2, elite: 20, berserk: 78 },
    levelRange: { min: 15, max: 20 },
  },
  void_lord: {
    id: "void_lord",
    name: "Lorde do Vazio",
    emoji: "⚫",
    description: "Entidade cósmica que devora realidades",
    baseHp: 600,
    baseDamage: 50,
    baseSpeed: 0.8,
    rarityWeights: { common: 1, elite: 15, berserk: 84 },
    levelRange: { min: 18, max: 25 },
  },
  colossus: {
    id: "colossus",
    name: "Colosso",
    emoji: "🏛️",
    description: "Construto gigantesco dos tempos antigos",
    baseHp: 800,
    baseDamage: 45,
    baseSpeed: 2.0,
    rarityWeights: { common: 1, elite: 10, berserk: 89 },
    levelRange: { min: 20, max: 30 },
  },
};

// Classe utilitária para gerenciar monstros
export class MonsterManager {
  static getMonster(id: MonsterId): MonsterClass {
    return MONSTER_CLASSES[id];
  }

  static getAllMonsters(): MonsterClass[] {
    return Object.values(MONSTER_CLASSES);
  }

  static getMonstersByLevel(level: number): MonsterClass[] {
    return Object.values(MONSTER_CLASSES).filter(
      (monster) =>
        level >= monster.levelRange.min && level <= monster.levelRange.max
    );
  }

  static getRandomMonsterId(playerLevel: number = 1): MonsterId {
    const availableMonsters = this.getMonstersByLevel(playerLevel);

    if (availableMonsters.length === 0) {
      // Fallback para monstros básicos se não houver nenhum disponível
      return Math.random() < 0.5 ? "goblin" : "wolf";
    }

    const randomMonster =
      availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    return randomMonster.id;
  }

  static generateMonsterStats(
    id: MonsterId,
    rarity: Rarity
  ): {
    hp: number;
    maxHp: number;
    damage: number;
    speed: number;
    level: number;
  } {
    const monster = this.getMonster(id);

    // Determina o nível baseado na raridade e range do monstro
    const levelRange = monster.levelRange.max - monster.levelRange.min;
    let level: number;

    switch (rarity) {
      case "common":
        level =
          monster.levelRange.min +
          Math.floor(Math.random() * Math.max(1, levelRange * 0.6));
        break;
      case "elite":
        level =
          monster.levelRange.min +
          Math.floor(levelRange * 0.4) +
          Math.floor(Math.random() * Math.max(1, levelRange * 0.6));
        break;
      case "berserk":
        level =
          monster.levelRange.min +
          Math.floor(levelRange * 0.7) +
          Math.floor(Math.random() * Math.max(1, levelRange * 0.3));
        break;
    }

    // Aplica multiplicadores de raridade
    const rarityMultipliers = {
      common: { hp: 1.0, damage: 1.0 },
      elite: { hp: 2.0, damage: 1.5 },
      berserk: { hp: 2.8, damage: 2.2 },
    };

    const multiplier = rarityMultipliers[rarity];
    const levelBonus = level * 0.15; // +15% por nível

    // Calcula stats finais
    const baseHp = Math.round(
      monster.baseHp * multiplier.hp * (1 + levelBonus)
    );
    const variance = 0.1 * baseHp; // ±10% de variação
    const hp = Math.round(baseHp + (Math.random() * 2 - 1) * variance);

    return {
      hp: Math.max(1, hp),
      maxHp: Math.max(1, hp),
      damage: Math.round(
        monster.baseDamage * multiplier.damage * (1 + levelBonus)
      ),
      speed: monster.baseSpeed,
      level: Math.max(1, level),
    };
  }

  static determineRarity(id: MonsterId): Rarity {
    const monster = this.getMonster(id);
    const weights = monster.rarityWeights;
    const total = weights.common + weights.elite + weights.berserk;
    const random = Math.random() * total;

    if (random < weights.common) return "common";
    if (random < weights.common + weights.elite) return "elite";
    return "berserk";
  }

  static isValidMonsterId(id: string): id is MonsterId {
    return id in MONSTER_CLASSES;
  }
}
