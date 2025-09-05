export type Attrs = { STR:number; AGI:number; INT:number; VIT:number; DEF:number; LCK:number; };

// NOVO BALANCEAMENTO DOS ATRIBUTOS:

// STR (Força): Aumenta dano base de forma mais impactante
// Cada ponto de STR = +3.2 de dano base (era 2.4)
export const heroBaseDamage = ({STR,AGI,INT}:Attrs) => Math.max(1, STR*3.2 + AGI*1.8 + INT*1.1);

// AGI (Agilidade): Reduz cooldown exponencialmente (sem mudança, já estava bom)
export const cooldownMsFromAGI = (agi:number) => 1800 * Math.pow(0.99, Math.max(0, agi));
export const apsFromAGI = (agi:number) => 1000 / cooldownMsFromAGI(agi);

// INT (Inteligência): Melhor multiplicador de ouro + dano mágico + chance de gemas
// Multiplicador de ouro: +0.6% por ponto (era 0.4%), cap aumentado para +300%
export const goldMultFromINT = (int:number) => 1 + Math.min(3.0, int*0.006);

// VIT (Vitalidade): Mais HP por ponto 
// Cada ponto de VIT = +18 HP (era 14)
export const maxHpFromVIT = (vit:number) => 520 + vit*18;

// DEF (Defesa): Redução de dano mais efetiva + regeneração natural
// Cada ponto de DEF = -1.2 de dano recebido (era -1) + 0.1% regen por segundo
export const applyDefense = (raw:number, def:number) => Math.max(1, Math.round(raw - def*1.2));
export const regenFromDEF = (def:number, maxHp:number) => Math.round(maxHp * (def * 0.001)); // 0.1% por ponto de DEF

// LCK (Sorte): Melhor chance de crítico + maior chance de gemas + esquiva
// Chance de crítico: 6% + LCK*0.3% (cap 60%) - era 5% + LCK*0.2% cap 50%
export const critChancePct = (lck:number) => Math.min(60, 6 + lck*0.3);
export const critMultiplier = 1.8; // Aumentado de 1.7 para 1.8
// Chance de esquiva: LCK*0.15% (cap 25%)
export const dodgeChancePct = (lck:number) => Math.min(25, lck*0.15);

// Chance de 💎 melhorada: 3% base + melhor scaling
export const gemChancePct = (level:number, lck:number, int:number) => {
  const lvl = Math.min(8, level/80*100); // 0..8% do level
  const lckBonus = Math.min(8, lck*0.12); // Era 0.1, agora 0.12
  const intBonus = Math.min(12, int*0.18); // Era 0.15, agora 0.18
  return 3 + lvl + lckBonus + intBonus; // Base 3% (era 2%)
};

// Dano do herói com variação leve e crítico opcional
export function rollHeroDamage(attrs: Attrs, isCrit: boolean) {
  const base = heroBaseDamage(attrs);
  const spread = base * 0.12; // ±12%
  const raw = base + (Math.random() * 2 - 1) * spread;
  const mult = isCrit ? critMultiplier : 1.0;
  return Math.max(1, Math.round(raw * mult));
}

// Chance de crítico do herói (0..1)
export const critChance01 = (lck:number) => Math.min(0.6, (6 + lck*0.3) / 100);

// Chance de esquiva do herói (0..1)
export const dodgeChance01 = (lck:number) => Math.min(0.25, (lck*0.15) / 100);
