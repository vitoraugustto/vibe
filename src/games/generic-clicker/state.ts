"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GenericState = {
  points: number;
  perTap: number;
  critChance: number;
  critMultiplier: number;
  lastSeen: string;
  tap: (now: number) => void;
};

export const useGenericStore = create<GenericState>()(
  persist(
    (set, get) => ({
      points: 0,
      perTap: 1,
      critChance: 0.1,
      critMultiplier: 2,
      lastSeen: new Date().toISOString(),
      tap: (now: number) => {
        const { perTap, critChance, critMultiplier, points } = get();
        const isCrit = Math.random() < critChance;
        const gain = isCrit ? perTap * critMultiplier : perTap;
        set({
          points: points + gain,
          lastSeen: new Date(now).toISOString(),
        });
      },
    }),
    {
      name: "save:generic-clicker"
    }
  )
);
