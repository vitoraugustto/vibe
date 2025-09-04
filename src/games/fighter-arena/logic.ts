export type Attrs = { STR:number; AGI:number; INT:number; VIT:number; DEF:number; LCK:number; };

// Cooldown em ms: 1800 * (0.99^AGI), sem cap
export const cooldownMsFromAGI = (agi:number) => 1800 * Math.pow(0.99, Math.max(0, agi));
export const apsFromAGI = (agi:number) => 1000 / cooldownMsFromAGI(agi);

// Dano base aproximado do herói (antes de DEF do alvo)
export const heroBaseDamage = ({STR,AGI,INT}:Attrs) => Math.max(1, STR*2.4 + AGI*1.7 + INT*0.9);

// Chance de crítico: 5% + LCK*0.2% (cap 50%)
export const critChancePct = (lck:number) => Math.min(50, 5 + lck*0.2);
export const critMultiplier = 1.7;

// HP Máx
export const maxHpFromVIT = (vit:number) => 520 + vit*14;

// Ouro por kill multiplicador via INT (até +200%)
export const goldMultFromINT = (int:number) => 1 + Math.min(2.0, int*0.004);

// Chance de 💎 base (não miniboss): 2% + min(level/100, 6%) + min(LCK*0.1%, 5%) + min(INT*0.15%, 10%)
export const gemChancePct = (level:number, lck:number, int:number) => {
  const lvl = Math.min(6, level/100*100); // 0..6
  const lckBonus = Math.min(5, lck*0.1);
  const intBonus = Math.min(10, int*0.15);
  return 2 + lvl + lckBonus + intBonus;
};

// Mitigação simplificada contra DEF (mantém dano mínimo 1)
export const applyDefense = (raw:number, def:number) => Math.max(1, raw - def);

// Dano do herói com variação leve e crítico opcional
export function rollHeroDamage(attrs: Attrs, isCrit: boolean) {
  const base = heroBaseDamage(attrs);
  const spread = base * 0.12; // ±12%
  const raw = base + (Math.random() * 2 - 1) * spread;
  const mult = isCrit ? 1.7 : 1.0;
  return Math.max(1, Math.round(raw * mult));
}

// Chance de crítico do herói (0..1)
export const critChance01 = (lck:number) => Math.min(0.5, (5 + lck*0.2) / 100);
