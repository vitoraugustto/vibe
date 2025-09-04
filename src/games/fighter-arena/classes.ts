import type { Attrs } from "@/games/fighter-arena/logic";

export type ClassId =
  | "warrior"
  | "rogue"
  | "mage"
  | "guardian"
  | "hunter"
  | "paladin"
  | "barbarian"
  | "arcanist"
  | "monk";

export interface HeroClass {
  id: ClassId;
  name: string;
  description: string;
  strengths: string[];
  icon: string;
  color: string;
  baseAttrs: Attrs;
}

export const HERO_CLASSES: Record<ClassId, HeroClass> = {
  warrior: {
    id: "warrior",
    name: "Guerreiro",
    description: "Tank pesado com força e defesa extremas, mas lento.",
    strengths: ["Força elevada", "Defesa máxima", "HP alto"],
    icon: "Sword",
    color: "text-orange-400",
    baseAttrs: { STR: 10, AGI: 5, INT: 3, VIT: 9, DEF: 9, LCK: 4 },
  },
  rogue: {
    id: "rogue",
    name: "Ladino",
    description: "Assassino veloz com agilidade e sorte excepcionais.",
    strengths: ["Velocidade máxima", "Críticos devastadores", "Sorte extrema"],
    icon: "Zap",
    color: "text-purple-400",
    baseAttrs: { STR: 5, AGI: 11, INT: 4, VIT: 4, DEF: 3, LCK: 9 },
  },
  mage: {
    id: "mage",
    name: "Mago",
    description:
      "Especialista em magia pura com inteligência suprema, mas frágil.",
    strengths: ["Inteligência máxima", "Dano mágico", "Multiplicadores"],
    icon: "Sparkles",
    color: "text-blue-400",
    baseAttrs: { STR: 3, AGI: 4, INT: 11, VIT: 4, DEF: 2, LCK: 7 },
  },
  guardian: {
    id: "guardian",
    name: "Guardião",
    description: "Fortaleza viva com defesa e vitalidade incomparáveis.",
    strengths: ["Vitalidade máxima", "Defesa absoluta", "Imortal"],
    icon: "Shield",
    color: "text-gray-400",
    baseAttrs: { STR: 5, AGI: 3, INT: 3, VIT: 11, DEF: 11, LCK: 3 },
  },
  hunter: {
    id: "hunter",
    name: "Caçador",
    description: "Combatente híbrido focado em força e velocidade.",
    strengths: ["Força + Agilidade", "Ataques rápidos", "Dano consistente"],
    icon: "Target",
    color: "text-green-400",
    baseAttrs: { STR: 8, AGI: 9, INT: 4, VIT: 5, DEF: 4, LCK: 6 },
  },
  paladin: {
    id: "paladin",
    name: "Paladino",
    description: "Guerreiro sagrado com força divina e proteção celestial.",
    strengths: ["Força sagrada", "Vitalidade divina", "Defesa abençoada"],
    icon: "Cross",
    color: "text-yellow-400",
    baseAttrs: { STR: 8, AGI: 4, INT: 5, VIT: 9, DEF: 8, LCK: 2 },
  },
  barbarian: {
    id: "barbarian",
    name: "Bárbaro",
    description: "Berserker selvagem com força bruta devastadora máxima.",
    strengths: ["Força absoluta", "Vitalidade selvagem", "Destruição pura"],
    icon: "Axe",
    color: "text-red-400",
    baseAttrs: { STR: 12, AGI: 5, INT: 2, VIT: 10, DEF: 4, LCK: 3 },
  },
  arcanist: {
    id: "arcanist",
    name: "Arcanista",
    description: "Mago supremo com magia transcendental e sorte cósmica.",
    strengths: ["Magia transcendental", "Sorte cósmica", "Poder absoluto"],
    icon: "Wand",
    color: "text-indigo-400",
    baseAttrs: { STR: 2, AGI: 4, INT: 12, VIT: 5, DEF: 3, LCK: 10 },
  },
  monk: {
    id: "monk",
    name: "Monge",
    description: "Mestre das artes marciais com equilíbrio perfeito.",
    strengths: ["Equilíbrio perfeito", "Harmonia total", "Versatilidade"],
    icon: "Hand",
    color: "text-amber-400",
    baseAttrs: { STR: 7, AGI: 7, INT: 6, VIT: 7, DEF: 6, LCK: 3 },
  },
};

// Classe utilitária para gerenciar heróis
export class HeroClassManager {
  static getClass(id: ClassId): HeroClass {
    return HERO_CLASSES[id];
  }

  static getClassByName(name: string): HeroClass | undefined {
    return Object.values(HERO_CLASSES).find((cls) => cls.name === name);
  }

  static getAllClasses(): HeroClass[] {
    return Object.values(HERO_CLASSES);
  }

  static getBaseAttrs(id: ClassId): Attrs {
    return { ...HERO_CLASSES[id].baseAttrs };
  }

  static getClassIcon(id: ClassId): string {
    return HERO_CLASSES[id].icon;
  }

  static getClassColor(id: ClassId): string {
    return HERO_CLASSES[id].color;
  }

  static isValidClassId(id: string): id is ClassId {
    return id in HERO_CLASSES;
  }
}
