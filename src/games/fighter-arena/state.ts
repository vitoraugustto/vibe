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
  regenFromDEF,
  dodgeChance01,
} from "@/games/fighter-arena/logic";
import { HeroClassManager, type ClassId } from "@/games/fighter-arena/classes";
import {
  MonsterManager,
  type MonsterId,
  type Rarity,
} from "@/games/fighter-arena/monsters";
import { ShopManager, type ShopItemId, type PlayerInventory } from "@/games/fighter-arena/shop";

export type Enemy = {
  id: string;
  monsterId: MonsterId;
  name: string;
  emoji: string;
  rarity: Rarity;
  level: number;
  hp: number;
  maxHp: number;
  nextAt: number;
  damage: number;
  speed: number;
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
  heroClass: ClassId;
  level: number;
  xp: number; // 0..1 (progresso visual por enquanto)
  hasNecromancy: boolean; // controla exibição da seção de aliados
  // Skills
  skills: Skill[];
  attrs: Attrs;
  upPoints: number;
  // Special abilities
  specialAbility: ClassSpecialAbility;
  canUseSpecialAbility: () => boolean;
  useSpecialAbility: () => "ok" | "cooldown" | "invalid";
  // Shop system
  inventory: PlayerInventory;
  buyItem: (itemId: ShopItemId) => "ok" | "no-gold" | "max-quantity" | "invalid";
  useHealthPotion: () => "ok" | "no-potions" | "full-hp";
  // Rest system
  isResting: boolean;
  toggleRest: () => void;
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
  setHeroClass: (heroClass: ClassId) => void;
  reroll: () => void; // stub: apenas zera heroClass/level/xp por enquanto
  resetAll: () => void;
  heroHp: number;
  heroMaxHp: number;
  heroNextAt: number;
  nextSpawnAt: number;
  lastSpawnDelay: number; // Para spawn variável
  recalcHeroMaxHp: () => void;
  floats: FloatNumber[];
  pushFloat: (f: Omit<FloatNumber, "id">) => void;
  tick: (now: number) => void;
  startCombatLoop: () => () => void;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Nova curva: AGI sem cap, cooldown = 1800 * 0.99^AGI
function adjustedCooldownFromAGI(agi: number) {
  return Math.max(50, Math.round(1800 * Math.pow(0.99, Math.max(0, agi || 0))));
}

function baseDefaults(heroClass: ClassId = "warrior") {
  const attrs = HeroClassManager.getBaseAttrs(heroClass);
  const heroMaxHp = maxHpFromVIT(attrs.VIT);
  return {
    gold: 0,
    gems: 0,
    heroClass,
    level: 1,
    xp: 0,
    hasNecromancy: false,
    skills: skillDefaults(),
    attrs,
    upPoints: 0, // Começar sem pontos, receberá 5 no primeiro level up
    // Special ability for this class
    specialAbility: { ...CLASS_SPECIAL_ABILITIES[heroClass] },
    // Shop inventory
    inventory: {
      health_potions: 0,
    } as PlayerInventory,
    // Rest system
    isResting: false,
    lastSpawnDelay: 2000, // Delay inicial
    enemies: [] as Enemy[],
    heroHp: heroMaxHp,
    heroMaxHp,
    heroNextAt:
      Date.now() +
      Math.max(50, Math.round(1800 * Math.pow(0.99, Math.max(0, attrs.AGI)))),
    nextSpawnAt: Date.now() + 2000, // Spawn inicial em 2s
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

// Sistema de habilidades especiais por classe
export type ClassSpecialAbility = {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number; // em segundos
  duration?: number; // em segundos (para habilidades com duração)
  lastUsed: number;
  isActive: boolean;
};

// Definições das habilidades especiais por classe
export const CLASS_SPECIAL_ABILITIES: Record<ClassId, ClassSpecialAbility> = {
  warrior: {
    id: "warrior_rage",
    name: "Fúria Guerreira",
    description: "+50% de dano por 8 segundos",
    icon: "Flame",
    cooldown: 25,
    duration: 8000,
    lastUsed: 0,
    isActive: false,
  },
  rogue: {
    id: "rogue_stealth", 
    name: "Golpe Sombrio",
    description: "Próximo ataque é crítico garantido + teleporta para alvo",
    icon: "Ghost",
    cooldown: 20,
    lastUsed: 0,
    isActive: false,
  },
  mage: {
    id: "mage_meteor",
    name: "Chuva de Meteoros",
    description: "Causa dano massivo em todos os inimigos",
    icon: "Zap",
    cooldown: 30,
    lastUsed: 0,
    isActive: false,
  },
  guardian: {
    id: "guardian_invincible",
    name: "Fortaleza Divina",
    description: "Invencível por 6 segundos",
    icon: "ShieldCheck",
    cooldown: 35,
    duration: 6000,
    lastUsed: 0,
    isActive: false,
  },
  hunter: {
    id: "hunter_volley",
    name: "Rajada Certeira",
    description: "Ataca todos os inimigos simultaneamente",
    icon: "Target",
    cooldown: 22,
    lastUsed: 0,
    isActive: false,
  },
  paladin: {
    id: "paladin_heal",
    name: "Luz Divina",
    description: "Cura completamente + bônus de dano sagrado por 10s",
    icon: "Heart",
    cooldown: 40,
    duration: 10000,
    lastUsed: 0,
    isActive: false,
  },
  barbarian: {
    id: "barbarian_berserker",
    name: "Fúria Berserker",
    description: "+100% de dano e velocidade por 10s",
    icon: "Skull",
    cooldown: 45,
    duration: 10000,
    lastUsed: 0,
    isActive: false,
  },
  arcanist: {
    id: "arcanist_timestop",
    name: "Parada Temporal",
    description: "Congela todos os inimigos por 5 segundos",
    icon: "Clock",
    cooldown: 50,
    duration: 5000,
    lastUsed: 0,
    isActive: false,
  },
  monk: {
    id: "monk_meditation",
    name: "Meditação Zen",
    description: "Regenera vida e mana rapidamente por 12s",
    icon: "Lotus",
    cooldown: 30,
    duration: 12000,
    lastUsed: 0,
    isActive: false,
  },
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
  // Shop functions
  buyItem: (itemId) => {
    const s = get();
    const item = ShopManager.getItem(itemId);
    if (!item) return "invalid";
    
    const currentQuantity = itemId === "health_potion" ? s.inventory.health_potions : 0;
    
    if (!ShopManager.canBuyItem(itemId, currentQuantity, s.gold)) {
      if (s.gold < item.price) return "no-gold";
      if (item.maxQuantity && currentQuantity >= item.maxQuantity) return "max-quantity";
      return "invalid";
    }
    
    const newInventory = { ...s.inventory };
    if (itemId === "health_potion") {
      newInventory.health_potions += 1;
    }
    
    set({
      gold: s.gold - item.price,
      inventory: newInventory,
    });
    
    return "ok";
  },
  
  useHealthPotion: () => {
    const s = get();
    if (s.inventory.health_potions <= 0) return "no-potions";
    if (s.heroHp >= s.heroMaxHp) return "full-hp";
    
    const healAmount = Math.round(s.heroMaxHp * 0.5); // Cura 50%
    const newHp = Math.min(s.heroMaxHp, s.heroHp + healAmount);
    const newInventory = { ...s.inventory };
    newInventory.health_potions -= 1;
    
    set({
      heroHp: newHp,
      inventory: newInventory,
    });
    
    return "ok";
  },
  
  toggleRest: () => {
    set((s) => ({ isResting: !s.isResting }));
  },
  
  // Special ability functions
  canUseSpecialAbility: () => {
    const s = get();
    const now = Date.now();
    return (now - s.specialAbility.lastUsed) >= (s.specialAbility.cooldown * 1000);
  },
  
  useSpecialAbility: () => {
    const s = get();
    const now = Date.now();
    
    if (!get().canUseSpecialAbility()) {
      return "cooldown";
    }
    
    const newAbility = { 
      ...s.specialAbility, 
      lastUsed: now,
      isActive: s.specialAbility.duration ? true : false
    };
    
    // Aplicar efeitos específicos da habilidade
    const updates: Partial<ArenaState> = {
      specialAbility: newAbility,
    };
    
    // Efeitos especiais por classe
    switch (s.heroClass) {
      case "guardian":
        // Fortaleza Divina: marcar como invencível
        break;
      case "paladin":
        // Luz Divina: curar completamente
        updates.heroHp = s.heroMaxHp;
        break;
      case "mage":
        // Chuva de Meteoros: dano em todos os inimigos
        if (s.enemies.length > 0) {
          const meteorDamage = Math.round(rollHeroDamage(s.attrs, false) * 2.5);
          const newEnemies = s.enemies.map(enemy => ({
            ...enemy,
            hp: Math.max(0, enemy.hp - meteorDamage)
          }));
          updates.enemies = newEnemies;
          
          // Float para cada inimigo atingido
          const newFloats = [...s.floats];
          s.enemies.forEach((enemy, i) => {
            newFloats.push({
              x: Math.random() * 70 + 15,
              y: Math.random() * 40 + 10,
              text: `🌟-${meteorDamage}`,
              color: "crit",
              until: now + 1000,
              id: `${now}-meteor-${i}`,
              target: "enemy",
              targetId: enemy.id,
            });
          });
          updates.floats = newFloats;
        }
        break;
      case "hunter":
        // Rajada Certeira: ataque em todos
        if (s.enemies.length > 0) {
          const volleyDamage = Math.round(rollHeroDamage(s.attrs, false) * 1.5);
          const newEnemies = s.enemies.map(enemy => ({
            ...enemy,
            hp: Math.max(0, enemy.hp - volleyDamage)
          }));
          updates.enemies = newEnemies;
        }
        break;
      case "arcanist":
        // Parada Temporal: todos os inimigos param de atacar temporariamente
        const newEnemies = s.enemies.map(enemy => ({
          ...enemy,
          nextAt: now + (s.specialAbility.duration || 5000)
        }));
        updates.enemies = newEnemies;
        break;
    }
    
    set(updates as ArenaState);
    return "ok";
  },
  
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

    // Seleciona um monstro baseado no nível do player
    const monsterId = MonsterManager.getRandomMonsterId(s.level);
    const monsterClass = MonsterManager.getMonster(monsterId);

    // Determina a raridade baseada nos pesos do monstro
    const rarity = MonsterManager.determineRarity(monsterId);

    // Gera os stats do monstro
    const stats = MonsterManager.generateMonsterStats(monsterId, rarity);

    const now = Date.now();
    const enemy: Enemy = {
      id: nanoid(),
      monsterId,
      name: monsterClass.name,
      emoji: monsterClass.emoji,
      rarity,
      level: stats.level,
      hp: stats.hp,
      maxHp: stats.maxHp,
      damage: stats.damage,
      speed: stats.speed,
      nextAt: now + rand(900, 1800),
    };

    set({ enemies: [...s.enemies, enemy] });
    return "ok";
  },
  clearEnemies: () => set({ enemies: [] }),
  countCommon: () => get().enemies.filter((e) => e.rarity === "common").length,
  countElite: () => get().enemies.filter((e) => e.rarity === "elite").length,
  countBerserk: () =>
    get().enemies.filter((e) => e.rarity === "berserk").length,
  setGold: (n) => set({ gold: n }),
  setGems: (n) => set({ gems: n }),
  addPoint: (attr) =>
    set((s) => {
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
  setHeroClass: (heroClass) =>
    set(() => {
      const attrs = HeroClassManager.getBaseAttrs(heroClass);
      const heroMaxHp = maxHpFromVIT(attrs.VIT);
      return {
        heroClass,
        attrs,
        heroMaxHp,
        heroHp: heroMaxHp,
        specialAbility: { ...CLASS_SPECIAL_ABILITIES[heroClass] },
        heroNextAt:
          Date.now() +
          Math.max(
            50,
            Math.round(1800 * Math.pow(0.99, Math.max(0, attrs.AGI)))
          ),
      };
    }),
  reroll: () =>
    set((s) => ({
      ...baseDefaults(s.heroClass),
    })),
  pushFloat: (f) =>
    set((s) => ({
      floats: [
        ...s.floats,
        {
          ...f,
          id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        },
      ],
    })),
  recalcHeroMaxHp: () =>
    set((s) => {
      const heroMaxHp = maxHpFromVIT(s.attrs.VIT);
      return {
        heroMaxHp,
        heroHp: Math.min(s.heroHp, heroMaxHp),
      };
    }),
  tick: (now) =>
    set((s) => {
      let { heroHp, heroNextAt, gold, gems, enemies, floats, nextSpawnAt, lastSpawnDelay, specialAbility } = s;
      let { level, xp, upPoints } = s;
      const { isResting } = s;
      const { heroMaxHp, attrs, heroClass } = s;
      
      // Atualizar habilidades especiais
      if (specialAbility.isActive && specialAbility.duration) {
        const abilityEndTime = specialAbility.lastUsed + specialAbility.duration;
        if (now >= abilityEndTime) {
          specialAbility = { ...specialAbility, isActive: false };
        }
      }
      
      // Remove floats expirados
      floats = floats.filter((f) => f.until > now);
      
      // Auto-spawn de monstros (pausado durante descanso)
      if (!isResting && now >= nextSpawnAt && enemies.length < 10) {
        // Determina quantos monstros spawnar (1-3, chances decrescentes)
        let spawnCount = 1;
        if (Math.random() < 0.3) spawnCount = 2; // 30% chance de 2
        if (Math.random() < 0.1) spawnCount = 3; // 10% chance de 3
        
        spawnCount = Math.min(spawnCount, 10 - enemies.length); // Respeita o limite
        
        for (let i = 0; i < spawnCount; i++) {
          // Seleciona um monstro baseado no nível do player
          const monsterId = MonsterManager.getRandomMonsterId(level);
          const monsterClass = MonsterManager.getMonster(monsterId);

          // Determina a raridade baseada nos pesos do monstro
          const rarity = MonsterManager.determineRarity(monsterId);

          // Gera os stats do monstro
          const stats = MonsterManager.generateMonsterStats(monsterId, rarity);

          const enemy: Enemy = {
            id: nanoid(),
            monsterId,
            name: monsterClass.name,
            emoji: monsterClass.emoji,
            rarity,
            level: stats.level,
            hp: stats.hp,
            maxHp: stats.maxHp,
            damage: stats.damage,
            speed: stats.speed,
            nextAt: now + rand(900, 1800),
          };
          enemies = [...enemies, enemy];
        }
        
        // Delay variável: 0.5s a 3s
        const delays = [500, 1000, 1500, 2000, 2500, 3000];
        const weights = [0.15, 0.25, 0.25, 0.20, 0.10, 0.05]; // Pesos para cada delay
        
        let randomValue = Math.random();
        let chosenDelay = delays[0];
        
        for (let i = 0; i < weights.length; i++) {
          randomValue -= weights[i];
          if (randomValue <= 0) {
            chosenDelay = delays[i];
            break;
          }
        }
        
        lastSpawnDelay = chosenDelay;
        nextSpawnAt = now + chosenDelay;
      } else if (enemies.length >= 10 && now >= nextSpawnAt) {
        // reprograma quando atingir cap
        nextSpawnAt = now + 3000;
      }
      
      // Herói ataca (pausado durante descanso)
      if (!isResting && enemies.some((e) => !e.dying && e.hp > 0) && now >= heroNextAt) {
        // Escolhe alvo aleatório entre os vivos e não-dying
        const live = enemies
          .map((e, i) => ({ e, i }))
          .filter((x) => !x.e.dying && x.e.hp > 0);
        if (live.length > 0) {
          const pick = live[Math.floor(Math.random() * live.length)];
          const idx = pick.i;
          const enemy = { ...enemies[idx] };
          
          // Aplicar modificadores de habilidade especial
          let isCrit = Math.random() < critChance01(attrs.LCK);
          let damageMultiplier = 1;
          let speedMultiplier = 1;
          
          // Rogue: próximo ataque é crítico garantido se stealth ativo
          if (heroClass === "rogue" && specialAbility.isActive) {
            isCrit = true;
            specialAbility = { ...specialAbility, isActive: false }; // Consome o stealth
          }
          
          // Warrior: +50% dano durante fúria
          if (heroClass === "warrior" && specialAbility.isActive) {
            damageMultiplier = 1.5;
          }
          
          // Barbarian: +100% dano e velocidade durante berserker
          if (heroClass === "barbarian" && specialAbility.isActive) {
            damageMultiplier = 2.0;
            speedMultiplier = 2.0;
          }
          
          // Paladin: dano sagrado durante luz divina
          if (heroClass === "paladin" && specialAbility.isActive) {
            damageMultiplier = 1.3;
          }
          
          let dmg = Math.round(rollHeroDamage(attrs, isCrit) * damageMultiplier);
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
          
          const cooldown = Math.round(adjustedCooldownFromAGI(attrs.AGI) / speedMultiplier);
          heroNextAt = now + cooldown;

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

            // Recompensas melhoradas com novo balanceamento
            const baseGold = Math.round((3 + enemy.level * 1.2) * goldMultFromINT(attrs.INT));
            gold += baseGold;
            
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
            const xpGain = 15 + enemyLevel * 6; // Levemente reduzido
            const xpNeed = 50 + level * 12; // Ajustado para progressão mais suave
            xp = xp + xpGain / Math.max(1, xpNeed);
            while (xp >= 1) {
              xp -= 1;
              level += 1;
              upPoints += 5; // 5 pontos por nível!
              // Feedback visual
              floats.push({
                x: 50,
                y: 20 + Math.random() * 20,
                text: `LVL ${level}! +5 pts`,
                color: "heal",
                until: now + 1200,
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
      
      // Inimigos atacam (pausado durante descanso E proteção de Guardian)
      const isInvincible = heroClass === "guardian" && specialAbility.isActive;
      if (!isResting && !isInvincible) {
        for (let i = 0; i < enemies.length; ++i) {
          const e = enemies[i];
          if (e.dying) continue; // não atacam durante animação de morte
          if (now >= e.nextAt) {
            // Verifica esquiva baseada na LCK
            const dodgeRoll = Math.random();
            const dodgeChance = dodgeChance01(attrs.LCK);
            
            if (dodgeRoll < dodgeChance) {
              // Herói esquivou do ataque!
              floats.push({
                x: Math.random() * 70 + 15,
                y: Math.random() * 40 + 10,
                text: `MISS!`,
                color: "heal",
                until: now + 700,
                id: `${now}-dodge-${Math.random()}`,
                target: "hero",
              });
            } else {
              // Ataque normal acerta
              let dmgIn = Math.max(1, Math.round(e.damage + e.maxHp * 0.02));
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
            }
            {
              const baseSpeed = Math.round(1800 * e.speed);
              e.nextAt =
                now + Math.max(400, baseSpeed) + Math.round(Math.random() * 200);
            }
            enemies[i] = { ...e };
          }
        }
      }
      
      // Regeneração natural baseada na DEF (0.1% por ponto de DEF por tick)
      if (heroHp > 0 && heroHp < heroMaxHp) {
        const naturalRegen = regenFromDEF(attrs.DEF, heroMaxHp);
        if (naturalRegen > 0) {
          heroHp = Math.min(heroMaxHp, heroHp + naturalRegen);
        }
      }
      
      // Regeneração do Monk durante meditação
      if (heroClass === "monk" && specialAbility.isActive) {
        const regenAmount = Math.round(heroMaxHp * 0.03); // 3% por tick durante meditação
        heroHp = Math.min(heroMaxHp, heroHp + regenAmount);
      }
      
      // Clamp heroHp
      heroHp = Math.max(0, Math.min(heroHp, heroMaxHp));
      return {
        heroHp,
        heroMaxHp,
        heroNextAt,
        nextSpawnAt,
        lastSpawnDelay,
        gold,
        gems,
        enemies,
        floats,
        level,
        xp,
        upPoints,
        isResting,
        specialAbility,
      } as Partial<ArenaState> as ArenaState;
    }),
  startCombatLoop: () => {
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      get().tick(Date.now());
      setTimeout(loop, 100);
    };
    loop();
    return () => {
      stopped = true;
    };
  },
  resetAll: () =>
    set(() => ({
      ...baseDefaults(),
    })),
}));
