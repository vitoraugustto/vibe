"use client";
import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Attrs } from "@/games/fighter-arena/logic";
import {
  maxHpFromVIT,
  goldMultFromINT,
  gemChancePct,
  applyDefense,
  rollHeroDamage,
  critChance01,
} from "@/games/fighter-arena/logic";

export type Rarity = "common" | "elite" | "berserk";
export type Enemy = {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  level?: number;
  hp: number;
  maxHp: number;
  nextAt: number;
  dpsHint?: number;
  agi?: number;
  dying?: boolean;
  deadAt?: number;
};

export type FloatNumber = {
  id: string;
  x: number;
  y: number;
  text: string;
  color: "hero" | "crit" | "enemy" | "heal";
  until: number;
  target?: "hero" | "enemy" | "misc";
  targetId?: string;
};

export type ArenaState = {
  gold: number;
  gems: number;
  heroClass: "Guerreiro" | "Ladino" | "Mago" | "Guardião" | "Caçador" | "Paladino" | "Bárbaro" | "Arcanista" | "Monge";
  level: number;
  xp: number;           // 0..1 (progresso visual por enquanto)
  hasNecromancy: boolean; // controla exibição da seção de aliados
  // Skills
  skills: Skill[];
  attrs: Attrs;
  upPoints: number;
  // Forge
  forgeCount: number;
  getForgeCost: () => number;
  forge: () => void;
  // Skill
  buyNecromancy: () => "ok" | "no-gems" | "already";
  getSkillCost: (id: SkillId) => number;
  canBuySkill: (id: SkillId) => boolean;
  purchaseSkill: (id: SkillId) => "ok" | "no-gems" | "maxed";
  toggleSkill: (id: SkillId) => "ok" | "not-owned";
  // Arena
  enemies: Enemy[];
  spawnEnemy: () => "ok" | "cap";
  clearEnemies: () => void;
  countCommon: () => number;
  countElite: () => number;
  countBerserk: () => number;
  setGold: (n: number) => void;
  setGems: (n: number) => void;
  addPoint: (attr: keyof Attrs) => void;
  grantPoint: (n: number) => void;
  reroll: () => void;     // stub: apenas zera heroClass/level/xp por enquanto
  heroHp: number;
  heroMaxHp: number;
  heroNextAt: number;
  nextSpawnAt: number;
  recalcHeroMaxHp: () => void;
  floats: FloatNumber[];
  pushFloat: (f: Omit<FloatNumber, "id">) => void;
  tick: (now: number) => void;
  startCombatLoop: () => () => void;
  resetAll: () => void;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Nova curva: AGI sem cap, cooldown = 1800 * 0.99^AGI
function adjustedCooldownFromAGI(agi: number) {
  return Math.max(50, Math.round(1800 * Math.pow(0.99, Math.max(0, agi || 0))));
}

function baseDefaults() {
  const baseVIT = 6;
  const baseAGI = 6;
  const heroMaxHp = maxHpFromVIT(baseVIT);
  return {
    gold: 0,
    gems: 0,
    heroClass: "Guerreiro" as const,
    level: 1,
    xp: 0,
    hasNecromancy: false,
  skills: skillDefaults(),
    attrs: { STR: 6, AGI: baseAGI, INT: 6, VIT: baseVIT, DEF: 4, LCK: 4 } as Attrs,
    upPoints: 0,
    forgeCount: 0,
    enemies: [] as Enemy[],
    heroHp: heroMaxHp,
    heroMaxHp,
    heroNextAt: Date.now() + Math.max(50, Math.round(1800 * Math.pow(0.99, Math.max(0, baseAGI)))) ,
    nextSpawnAt: Date.now() + 5000,
    floats: [] as FloatNumber[],
  };
}

export type SkillId = "necromancy" | "revive" | "regeneration";
export type Skill = {
  id: SkillId;
  name: string;
  desc: string;
  level: number; // current level
  maxLevel: number;
  baseCost: number; // in gems, cost for level 1
  scalable?: boolean; // if true, cost increases with level
  toggle?: boolean; // has active toggle
  active?: boolean; // current toggle state
};

function skillDefaults(): Skill[] {
  return [
    {
      id: "necromancy",
      name: "Necromancia",
      desc: "Converte mortos em aliados.",
      level: 0,
      maxLevel: 1,
      baseCost: 1,
      scalable: false,
      toggle: true,
      active: false,
    },
    {
      id: "revive",
      name: "Reviver",
      desc: "Ressuscita o herói (cargas).",
      level: 0,
      maxLevel: 3,
      baseCost: 2,
      scalable: true,
      toggle: false,
    },
    {
      id: "regeneration",
      name: "Regeneração",
      desc: "0,4% do HP máx × nível por segundo.",
      level: 0,
      maxLevel: 3,
      baseCost: 1,
      scalable: true,
      toggle: false,
    },
  ];
}

function skillCostForNext(s: Skill): number {
  if (!s.scalable) return s.baseCost;
  // simple scaling: base + level
  return s.baseCost + s.level;
}

export const useArenaStore = create<ArenaState>((set, get) => ({
  ...baseDefaults(),
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
    // Back-compat: map to skills system
    const res = get().purchaseSkill("necromancy");
    if (res === "ok") return "ok";
    if (res === "no-gems") return "no-gems";
    // If maxed or already purchased, report already
    return "already";
  },
  getSkillCost: (id) => {
    const s = get();
    const sk = s.skills.find((x) => x.id === id);
    if (!sk) return 0;
    return skillCostForNext(sk);
  },
  canBuySkill: (id) => {
    const s = get();
    const sk = s.skills.find((x) => x.id === id);
    if (!sk) return false;
    if (sk.level >= sk.maxLevel) return false;
    const cost = skillCostForNext(sk);
    return s.gems >= cost;
  },
  purchaseSkill: (id) => {
    const s = get();
    const idx = s.skills.findIndex((x) => x.id === id);
    if (idx < 0) return "maxed";
    const sk = s.skills[idx];
    if (sk.level >= sk.maxLevel) return "maxed";
    const cost = skillCostForNext(sk);
    if (s.gems < cost) return "no-gems";
    const next = { ...sk, level: sk.level + 1 } as Skill;
    const skills = [...s.skills];
    skills[idx] = next;
    const patch: Partial<ArenaState> = { skills, gems: s.gems - cost };
    // Side-effect: necromancy flips hasNecromancy when acquired
    if (id === "necromancy" && next.level > 0) {
      (patch as Partial<ArenaState>).hasNecromancy = true as unknown as never;
    }
    set(patch as ArenaState);
    return "ok";
  },
  toggleSkill: (id) => {
    const s = get();
    const idx = s.skills.findIndex((x) => x.id === id);
    if (idx < 0) return "not-owned";
    const sk = s.skills[idx];
    if (sk.level <= 0 || !sk.toggle) return "not-owned";
    const next = { ...sk, active: !sk.active } as Skill;
    const skills = [...s.skills];
    skills[idx] = next;
    // Mirror hasNecromancy to skill active if applicable
    if (id === "necromancy") set({ skills, hasNecromancy: !!next.active });
    else set({ skills });
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
    const now = Date.now();
    const level = (rarity === "common" ? 1 : rarity === "elite" ? 3 : 5) + Math.floor(Math.random() * 3);
    const enemy: Enemy = {
      id: nanoid(),
      name: pick.name,
      emoji: pick.emoji,
      rarity,
      level,
      hp,
      maxHp: hp,
      nextAt: now + rand(900, 1800),
    };
    set({ enemies: [...s.enemies, enemy] });
    return "ok";
  },
  clearEnemies: () => set({ enemies: [] }),
  countCommon: () => get().enemies.filter((e) => e.rarity === "common").length,
  countElite: () => get().enemies.filter((e) => e.rarity === "elite").length,
  countBerserk: () => get().enemies.filter((e) => e.rarity === "berserk").length,
  setGold: (n) => set({ gold: n }),
  setGems: (n) => set({ gems: n }),
  addPoint: (attr) => set((s) => {
    if (s.upPoints <= 0) return s;
    const nextAttrs = { ...s.attrs, [attr]: s.attrs[attr] + 1 } as Attrs;
    // Se aumentar VIT, recalcula o HP máx do herói
    const nextMax = maxHpFromVIT(nextAttrs.VIT);
    return {
      upPoints: s.upPoints - 1,
      attrs: nextAttrs,
      heroMaxHp: nextMax,
      heroHp: Math.min(s.heroHp, nextMax),
    } as Partial<ArenaState> as ArenaState;
  }),
  grantPoint: (n) => set((s) => ({ upPoints: Math.max(0, s.upPoints + n) })),
  reroll: () => set(() => ({
  ...baseDefaults(),
  })),
  pushFloat: (f) => set((s) => ({
    floats: [
      ...s.floats,
      {
        ...f,
        id: `${Date.now()}-${Math.floor(Math.random()*10000)}`,
      },
    ],
  })),
  recalcHeroMaxHp: () => set((s) => {
    const heroMaxHp = maxHpFromVIT(s.attrs.VIT);
    return {
      heroMaxHp,
      heroHp: Math.min(s.heroHp, heroMaxHp),
    };
  }),
  tick: (now) => set((s) => {
    let { heroHp, heroNextAt, gold, gems, enemies, floats, nextSpawnAt } = s;
    let { level, xp, upPoints } = s;
    const { heroMaxHp, attrs } = s;
    // Remove floats expirados
    floats = floats.filter((f) => f.until > now);
    // Auto-spawn de monstros
    if (now >= nextSpawnAt && enemies.length < 10) {
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
      if (r >= 95) rarity = "berserk"; else if (r >= 85) rarity = "elite";
      const baseHp = rarity === "common" ? 40 : rarity === "elite" ? 90 : 120;
      const variance = 0.1 * baseHp;
      const hp = Math.round(baseHp + (Math.random() * 2 - 1) * variance);
      const levelE = (rarity === "common" ? 1 : rarity === "elite" ? 3 : 5) + Math.floor(Math.random() * 3);
      const enemy: Enemy = {
        id: nanoid(),
        name: pick.name,
        emoji: pick.emoji,
        rarity,
        level: levelE,
        hp,
        maxHp: hp,
        nextAt: now + rand(900, 1800),
      };
      enemies = [...enemies, enemy];
      nextSpawnAt = now + rand(6000, 10000);
    } else if (enemies.length >= 10 && now >= nextSpawnAt) {
      // reprograma quando atingir cap
      nextSpawnAt = now + 3000;
    }
    // Herói ataca
    if (enemies.some((e) => !e.dying && e.hp > 0) && now >= heroNextAt) {
      // Escolhe alvo aleatório entre os vivos e não-dying
      const live = enemies.map((e, i) => ({ e, i })).filter((x) => !x.e.dying && x.e.hp > 0);
      if (live.length > 0) {
        const pick = live[Math.floor(Math.random() * live.length)];
        const idx = pick.i;
        const enemy = { ...enemies[idx] };
        const isCrit = Math.random() < critChance01(attrs.LCK);
        let dmg = rollHeroDamage(attrs, isCrit);
        dmg = applyDefense(dmg, 0); // enemyDef=0
        enemy.hp -= dmg;
        floats.push({
          x: Math.random() * 70 + 15,
          y: Math.random() * 40 + 10,
          text: `-${dmg}`,
          color: isCrit ? "crit" : "hero",
          until: now + 700,
          id: `${now}-hero-${Math.random()}`,
          target: "enemy",
          targetId: enemy.id,
        });
        heroNextAt = now + adjustedCooldownFromAGI(attrs.AGI);

        // Se morreu, marca como dying e agenda remoção após pequena demora
        if (enemy.hp <= 0 && !enemy.dying) {
          enemy.hp = 0;
          enemy.dying = true;
          enemy.deadAt = now + 450;

          // Float de KO
          floats.push({
            x: 50,
            y: 50,
            text: `☠`,
            color: "enemy",
            until: now + 800,
            id: `${now}-ko-${Math.random()}`,
            target: "enemy",
            targetId: enemy.id,
          });

          // Recompensas
          gold += Math.round(5 * goldMultFromINT(attrs.INT));
          const gemChance = gemChancePct(level, attrs.LCK, attrs.INT);
          if (Math.random() < gemChance / 100) {
            gems += 1;
            floats.push({
              x: Math.random() * 70 + 15,
              y: Math.random() * 40 + 10,
              text: `💎`,
              color: "heal",
              until: now + 900,
              id: `${now}-gem-${Math.random()}`,
              target: "misc",
            });
          }

          // Experiência e Level Up (sistema fracionado 0..1)
          const enemyLevel = enemy.level ?? 1;
          const xpGain = 18 + enemyLevel * 8;
          const xpNeed = 60 + level * 15;
          xp = xp + xpGain / Math.max(1, xpNeed);
          while (xp >= 1) {
            xp -= 1;
            level += 1;
            upPoints += 1; // 1 ponto por nível
            // Feedback visual
            floats.push({
              x: 50,
              y: 20 + Math.random() * 20,
              text: `LVL ${level}!`,
              color: "heal",
              until: now + 1000,
              id: `${now}-lvl-${Math.random()}`,
              target: "hero",
            });
          }
        }

        // Persiste o inimigo atualizado (vivo ou morrendo)
        enemies = enemies.map((e, i) => (i === idx ? enemy : e));
      }
    }

    // Remoção retardada de inimigos mortos (após animação)
    enemies = enemies.filter((e) => !(e.dying && (e.deadAt ?? 0) <= now));
    // Inimigos atacam
    for (let i = 0; i < enemies.length; ++i) {
      const e = enemies[i];
      if (e.dying) continue; // não atacam durante animação de morte
      if (now >= e.nextAt) {
        let dmgIn = Math.max(1, Math.round(8 + (e.maxHp * 0.06)));
        dmgIn = applyDefense(dmgIn, attrs.DEF);
        heroHp = Math.max(0, heroHp - dmgIn);
        floats.push({
          x: Math.random() * 70 + 15,
          y: Math.random() * 40 + 10,
          text: `-${dmgIn}`,
          color: "enemy",
          until: now + 700,
          id: `${now}-enemy-${Math.random()}`,
          target: "hero",
        });
        {
          const eAgi = (e.agi ?? 8);
          const base = Math.round(1800 * Math.pow(0.99, Math.max(1, eAgi)));
          e.nextAt = now + Math.max(400, base) + Math.round(Math.random() * 200);
        }
        enemies[i] = { ...e };
      }
    }
    // Clamp heroHp
    heroHp = Math.max(0, Math.min(heroHp, heroMaxHp));
  return { heroHp, heroMaxHp, heroNextAt, nextSpawnAt, gold, gems, enemies, floats, level, xp, upPoints } as Partial<ArenaState> as ArenaState;
  }),
  startCombatLoop: () => {
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      get().tick(Date.now());
      setTimeout(loop, 100);
    };
    loop();
    return () => { stopped = true; };
  },
  resetAll: () => set(() => ({
  ...baseDefaults(),
  })),
}));
