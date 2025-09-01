"use client";
import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Attrs } from "@/games/fighter-arena/logic";

export type Rarity = "common" | "elite" | "berserk";
export type Enemy = {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  hp: number;
  maxHp: number;
};

export type ArenaState = {
  gold: number;
  gems: number;
  heroClass: "Guerreiro" | "Ladino" | "Mago" | "Guardião" | "Caçador" | "Paladino" | "Bárbaro" | "Arcanista" | "Monge";
  level: number;
  xp: number;           // 0..1 (progresso visual por enquanto)
  hasNecromancy: boolean; // controla exibição da seção de aliados
  attrs: Attrs;
  upPoints: number;
  // Forge
  forgeCount: number;
  getForgeCost: () => number;
  forge: () => void;
  // Skill
  buyNecromancy: () => "ok" | "no-gems" | "already";
  // Arena
  enemies: Enemy[];
  spawnEnemy: () => "ok" | "cap";
  countCommon: () => number;
  countElite: () => number;
  countBerserk: () => number;
  setGold: (n: number) => void;
  setGems: (n: number) => void;
  addPoint: (attr: keyof Attrs) => void;
  grantPoint: (n: number) => void;
  reroll: () => void;     // stub: apenas zera heroClass/level/xp por enquanto
};

export const useArenaStore = create<ArenaState>((set, get) => ({
  gold: 0,
  gems: 0,
  heroClass: "Guerreiro",
  level: 1,
  xp: 0.2,
  hasNecromancy: false,
  attrs: { STR:6, AGI:6, INT:6, VIT:6, DEF:4, LCK:4 },
  upPoints: 0,
  forgeCount: 0,
  enemies: [],
  getForgeCost: () => {
    const s = get();
    const cost = Math.round(1 + Math.pow(s.forgeCount, 1.35) + s.level * 0.3);
    return Math.max(1, cost);
  },
  forge: () => set((s) => {
    const cost = Math.round(1 + Math.pow(s.forgeCount, 1.35) + s.level * 0.3);
    const finalCost = Math.max(1, cost);
    if (s.gold < finalCost) return s;
    const nextAttrs = { ...s.attrs } as Attrs;
    (Object.keys(nextAttrs) as Array<keyof Attrs>).forEach((k) => {
      nextAttrs[k] = nextAttrs[k] + 1;
    });
    return {
      gold: s.gold - finalCost,
      forgeCount: s.forgeCount + 1,
      attrs: nextAttrs,
    } as Partial<ArenaState> as ArenaState;
  }),
  buyNecromancy: () => {
    const s = get();
    if (s.hasNecromancy) return "already";
    if (s.gems < 1) return "no-gems";
    set({ hasNecromancy: true, gems: s.gems - 1 });
    return "ok";
  },
  spawnEnemy: () => {
    const s = get();
    if (s.enemies.length >= 10) return "cap";
    const pool = [
      { name: "Lobo", emoji: "🐺" },
      { name: "Goblin", emoji: "👾" },
      { name: "Aranha", emoji: "🕷️" },
      { name: "Slime", emoji: "🟢" },
      { name: "Morcego", emoji: "🦇" },
    ];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const r = Math.random() * 100;
    let rarity: Rarity = "common";
    if (r >= 95) rarity = "berserk"; // 5%
    else if (r >= 85) rarity = "elite"; // 10%
    else rarity = "common"; // 85%
    const baseHp = rarity === "common" ? 40 : rarity === "elite" ? 90 : 120;
    const variance = 0.1 * baseHp; // ±10%
    const hp = Math.round(baseHp + (Math.random() * 2 - 1) * variance);
    const enemy: Enemy = {
      id: nanoid(),
      name: pick.name,
      emoji: pick.emoji,
      rarity,
      hp,
      maxHp: hp,
    };
    set({ enemies: [...s.enemies, enemy] });
    return "ok";
  },
  countCommon: () => get().enemies.filter((e) => e.rarity === "common").length,
  countElite: () => get().enemies.filter((e) => e.rarity === "elite").length,
  countBerserk: () => get().enemies.filter((e) => e.rarity === "berserk").length,
  setGold: (n) => set({ gold: n }),
  setGems: (n) => set({ gems: n }),
  addPoint: (attr) => set((s) => {
    if (s.upPoints <= 0) return s;
    return {
      upPoints: s.upPoints - 1,
      attrs: { ...s.attrs, [attr]: s.attrs[attr] + 1 },
    } as Partial<ArenaState> as ArenaState;
  }),
  grantPoint: (n) => set((s) => ({ upPoints: Math.max(0, s.upPoints + n) })),
  reroll: () => set((s) => ({
    heroClass: "Guerreiro",
    level: 1,
    xp: 0,
    hasNecromancy: false,
    attrs: { STR:6, AGI:6, INT:6, VIT:6, DEF:4, LCK:4 },
    upPoints: 0,
    forgeCount: 0,
    enemies: [],
    gold: s.gold,
    gems: s.gems,
  })),
}));
