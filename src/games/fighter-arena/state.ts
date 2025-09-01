"use client";
import { create } from "zustand";

export type ArenaState = {
  gold: number;
  gems: number;
  heroClass: "Guerreiro" | "Ladino" | "Mago" | "Guardião" | "Caçador" | "Paladino" | "Bárbaro" | "Arcanista" | "Monge";
  level: number;
  xp: number;           // 0..1 (progresso visual por enquanto)
  hasNecromancy: boolean; // controla exibição da seção de aliados
  setGold: (n: number) => void;
  setGems: (n: number) => void;
  reroll: () => void;     // stub: apenas zera heroClass/level/xp por enquanto
};

export const useArenaStore = create<ArenaState>((set) => ({
  gold: 0,
  gems: 0,
  heroClass: "Guerreiro",
  level: 1,
  xp: 0.2,
  hasNecromancy: false,
  setGold: (n) => set({ gold: n }),
  setGems: (n) => set({ gems: n }),
  reroll: () => set({ heroClass: "Guerreiro", level: 1, xp: 0, hasNecromancy: false }),
}));
