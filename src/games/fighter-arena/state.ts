"use client";
import { create } from "zustand";
import type { Attrs } from "@/games/fighter-arena/logic";

export type ArenaState = {
  gold: number;
  gems: number;
  heroClass: "Guerreiro" | "Ladino" | "Mago" | "Guardião" | "Caçador" | "Paladino" | "Bárbaro" | "Arcanista" | "Monge";
  level: number;
  xp: number;           // 0..1 (progresso visual por enquanto)
  hasNecromancy: boolean; // controla exibição da seção de aliados
  attrs: Attrs;
  upPoints: number;
  setGold: (n: number) => void;
  setGems: (n: number) => void;
  addPoint: (attr: keyof Attrs) => void;
  grantPoint: (n: number) => void;
  reroll: () => void;     // stub: apenas zera heroClass/level/xp por enquanto
};

export const useArenaStore = create<ArenaState>((set) => ({
  gold: 0,
  gems: 0,
  heroClass: "Guerreiro",
  level: 1,
  xp: 0.2,
  hasNecromancy: false,
  attrs: { STR:6, AGI:6, INT:6, VIT:6, DEF:4, LCK:4 },
  upPoints: 0,
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
    gold: s.gold,
    gems: s.gems,
  })),
}));
