"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useArenaStore } from "@/games/fighter-arena/state";
import { gameMeta } from "@/games/fighter-arena/meta";
import { type Attrs } from "@/games/fighter-arena/logic";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components";
import { SectionCard, type SectionCardAction } from "./components/SectionCard";
import { XpBar } from "./components/Bars";
import { FighterCard } from "./components/FighterCard";
import { MonsterCard } from "./components/MonsterCard";
import { AttributeButton } from "./components/AttributeButton";
import { ShopModal } from "./components/ShopModal";
import { InventoryModal } from "./components/InventoryModal";
import GameOverModal from "./components/GameOverModal";
import ClassSelectionModal from "./components/ClassSelectionModal";
import { HeroClassManager, type ClassId } from "@/games/fighter-arena/classes";
import { icons, LucideIcon } from "lucide-react";
import { toast } from "sonner";

export default function Game() {
  const {
    gold,
    gems,
    heroClass,
    level,
    xp,
    attrs,
    upPoints,
    addPoint,
    enemies,
    heroHp,
    heroMaxHp,
    floats,
    startCombatLoop,
    setHeroClass,
    isResting,
    toggleRest,
    canUseSpecialAbility,
    specialAbility,
    inventory,
  } = useArenaStore();

  const [openGameOver, setOpenGameOver] = useState(false);
  const [openClassSelection, setOpenClassSelection] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);
  const [openShop, setOpenShop] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);
  const [isRestartingToChooseClass, setIsRestartingToChooseClass] = useState(false);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const fighterAnchorRef = useRef<HTMLDivElement | null>(null);
  const enemyRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [floatPos, setFloatPos] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const posMapRef = useRef<Record<string, { x: number; y: number }>>({});
  const [heroHit, setHeroHit] = useState(false);
  const [monsterHits, setMonsterHits] = useState<Set<string>>(new Set());
  const [levelUpGlow, setLevelUpGlow] = useState(false);
  const lastFloatIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const dispose = startCombatLoop();
    return () => dispose();
  }, [startCombatLoop]);

  // Abre modal de Game Over quando HP chega a 0
  useEffect(() => {
    if (heroHp <= 0) setOpenGameOver(true);
  }, [heroHp]);

  useEffect(() => {
    const container = arenaRef.current;
    if (!container) return;
    const current = posMapRef.current;

    const next: Record<string, { x: number; y: number }> = {};
    const seen = new Set<string>();

    const offsetFromId = (id: string) => {
      let h = 0;
      for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
      const jx = ((h % 100) / 100 - 0.5) * 18;
      const jy = (((h >>> 8) % 100) / 100 - 0.5) * 12;
      return { jx, jy };
    };

    for (const f of floats) {
      seen.add(f.id);
      if (current[f.id]) {
        next[f.id] = current[f.id];
        continue;
      }
      let targetEl: HTMLElement | null = null;
      let referenceContainer: HTMLElement = container;

      if (f.target === "enemy" && f.targetId) {
        targetEl = (enemyRefs.current[f.targetId] as HTMLElement) || null;
      } else if (f.target === "hero") {
        targetEl = fighterAnchorRef.current as HTMLElement | null;
        referenceContainer = document.body; // Use o body como referência para hero floats
      } else {
        targetEl = container;
      }

      if (!targetEl) continue;

      const r = targetEl.getBoundingClientRect();
      const refRect = referenceContainer.getBoundingClientRect();

      const cx = r.left - refRect.left + r.width / 2;
      const cy = r.top - refRect.top + r.height / 2;
      const { jx, jy } = offsetFromId(f.id);
      next[f.id] = { x: cx + jx, y: cy + jy - 16 };
    }

    const currentKeys = Object.keys(current);
    const nextKeys = Object.keys(next);
    const sameSize = currentKeys.length === nextKeys.length;
    const sameKeys = sameSize && currentKeys.every((k) => next[k]);
    if (!sameKeys) {
      posMapRef.current = next;
      setFloatPos(next);
    }
  }, [floats]);

  useEffect(() => {
    const last = lastFloatIdsRef.current;
    const current = new Set<string>();
    for (const f of floats) {
      current.add(f.id);
      if (!last.has(f.id)) {
        if (f.target === "hero" && f.color === "enemy") {
          setHeroHit(true);
          setTimeout(() => setHeroHit(false), 240);
        } else if (f.target === "enemy" && f.targetId) {
          setMonsterHits((prev) => {
            const n = new Set(prev);
            n.add(f.targetId!);
            setTimeout(() => {
              setMonsterHits((p2) => {
                const m = new Set(p2);
                m.delete(f.targetId!);
                return m;
              });
            }, 260);
            return n;
          });
        } else if (f.target === "hero" && f.text.includes("LVL")) {
          // Level up effect
          setLevelUpGlow(true);
          setTimeout(() => setLevelUpGlow(false), 2000);
        }
      }
    }
    lastFloatIdsRef.current = current;
  }, [floats]);

  const HeaderIcon =
    (icons as Record<string, LucideIcon>)[gameMeta.icon] ||
    (icons as Record<string, LucideIcon>)["Swords"] ||
    icons["Gamepad"];
  // Pequeno feedback quando nível sobe
  const prevLevelRef = useRef<number>(level);
  useEffect(() => {
    if (level > prevLevelRef.current) {
      toast.success(`Nível ${level} alcançado! +1 ponto para distribuir`);
      prevLevelRef.current = level;
    }
  }, [level]);

  const handleRestart = () => {
    setOpenGameOver(false);
    setIsRestartingToChooseClass(true);
    setOpenClassSelection(true);
  };

  const handleClassSelection = (selectedClass: ClassId) => {
    useArenaStore.getState().resetAll();
    setHeroClass(selectedClass);
    setOpenClassSelection(false);
    setIsRestartingToChooseClass(false);
    const className = HeroClassManager.getClass(selectedClass).name;
    toast(`Novo ${className} pronto!`);
  };

  const handleCloseClassModal = () => {
    setOpenClassSelection(false);
    setIsRestartingToChooseClass(false);
  };

  // Using advanced bars; no need for separate smoothed percentages here

  return (
    <div className="relative min-h-[100svh] md:h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 via-purple-950/5 to-indigo-950/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative container mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 min-h-[100svh] md:h-screen overflow-auto md:overflow-hidden flex flex-col">
        {/* Floats globais para hero */}
        <div className="fixed inset-0 pointer-events-none select-none z-50">
          {floats
            .filter((f) => f.target === "hero")
            .map((f) => {
              const p = floatPos[f.id];
              const getDamageClass = () => {
                if (f.color === "crit") return "fa-float-crit text-yellow-300";
                if (f.text.includes("LVL")) return "fa-level-up-float";
                if (f.color === "hero") return "fa-float fa-damage-hero";
                if (f.color === "enemy") return "fa-float fa-damage-enemy";
                if (f.color === "heal") return "fa-float fa-damage-heal";
                if (f.text.includes("💎")) return "fa-float fa-damage-gem";
                return "fa-float";
              };

              return (
                <span
                  key={f.id}
                  className={`absolute left-0 top-0 ${getDamageClass()}`}
                  style={{
                    left: (p ? p.x : 0) + "px",
                    top: (p ? p.y : 0) + "px",
                    transform: `translate(-50%, -10px)`,
                    pointerEvents: "none",
                    opacity: 0.98,
                    fontSize: f.text.includes("LVL")
                      ? "18px"
                      : f.color === "crit"
                      ? "16px"
                      : "14px",
                    fontWeight: f.text.includes("LVL")
                      ? "800"
                      : f.color === "crit"
                      ? "800"
                      : "700",
                  }}
                >
                  {f.text}
                </span>
              );
            })}
        </div>

        <GameOverModal open={openGameOver} onRestart={handleRestart} />
        <ClassSelectionModal
          open={openClassSelection}
          onSelectClass={handleClassSelection}
          currentClass={heroClass}
          canClose={isRestartingToChooseClass} // Só pode fechar se foi reiniciado manualmente
          onClose={handleCloseClassModal}
        />
        
        {/* Modal de Status */}
        <Dialog open={openSkills} onOpenChange={setOpenSkills}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Status do Herói</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-200">Atributos Atuais</h4>
                  <div className="space-y-1 text-sm">
                    <div>STR: {attrs.STR} (Dano: +{(attrs.STR * 3.2).toFixed(1)})</div>
                    <div>AGI: {attrs.AGI} (Velocidade: {(1000 / (1800 * Math.pow(0.99, attrs.AGI)) * 1000).toFixed(0)}ms)</div>
                    <div>INT: {attrs.INT} (Ouro: +{((attrs.INT * 0.6)).toFixed(1)}%)</div>
                    <div>VIT: {attrs.VIT} (HP: +{attrs.VIT * 18})</div>
                    <div>DEF: {attrs.DEF} (Redução: -{(attrs.DEF * 1.2).toFixed(1)}, Regen: {(attrs.DEF * 0.1).toFixed(1)}%/s)</div>
                    <div>LCK: {attrs.LCK} (Crítico: {(6 + attrs.LCK * 0.3).toFixed(1)}%, Esquiva: {(attrs.LCK * 0.15).toFixed(1)}%)</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-200">Habilidade Especial</h4>
                  <div className="text-sm space-y-1">
                    <div>Classe: {heroClass.charAt(0).toUpperCase() + heroClass.slice(1)}</div>
                    <div>Status: {specialAbility.isActive ? "🔥 Ativa" : "💤 Inativa"}</div>
                    <div>Cooldown: {(specialAbility.lastUsed + specialAbility.cooldown * 1000) > Date.now() ? `${Math.ceil(((specialAbility.lastUsed + specialAbility.cooldown * 1000) - Date.now()) / 1000)}s` : "Pronta"}</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal da Loja */}
        <ShopModal open={openShop} onClose={() => setOpenShop(false)} />

        {/* Modal do Inventário */}
        <InventoryModal open={openInventory} onClose={() => setOpenInventory(false)} />
        <style jsx global>{`
          @keyframes faHitFlash {
            0% {
              filter: brightness(1) saturate(1);
              box-shadow: 0 0 0 rgba(255, 255, 255, 0);
            }
            50% {
              filter: brightness(1.8) saturate(1.3);
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
            }
            100% {
              filter: brightness(1) saturate(1);
              box-shadow: 0 0 0 rgba(255, 255, 255, 0);
            }
          }
          .fa-hit-flash {
            animation: faHitFlash 300ms ease-out;
          }

          @keyframes faFloatUp {
            0% {
              opacity: 0;
              transform: translate(-50%, 12px) scale(0.6);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, 4px) scale(1.2);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -30px) scale(0.8);
            }
          }
          .fa-float {
            will-change: transform, opacity;
            animation: faFloatUp 1400ms ease-out forwards;
            font-weight: 800;
            font-size: 15px;
            text-shadow: 0 0 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.7),
              0 2px 4px rgba(0, 0, 0, 1);
            filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.8));
          }

          @keyframes faCritPop {
            0% {
              opacity: 0.2;
              transform: translate(-50%, 10px) scale(0.5) rotate(-5deg);
            }
            30% {
              opacity: 1;
              transform: translate(-50%, -4px) scale(1.5) rotate(2deg);
            }
            60% {
              opacity: 0.9;
              transform: translate(-50%, -12px) scale(1.6) rotate(-1deg);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -35px) scale(1.1) rotate(0deg);
            }
          }
          .fa-float-crit {
            will-change: transform, opacity;
            animation: faCritPop 1600ms ease-out forwards;
            font-weight: 900;
            font-size: 18px;
            color: #ffd700;
            text-shadow: 0 0 6px rgba(0, 0, 0, 1),
              0 0 12px rgba(255, 215, 0, 0.8), 0 0 18px rgba(255, 215, 0, 0.6),
              0 3px 6px rgba(0, 0, 0, 1);
            filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.9));
          }

          @keyframes faLevelUpFloat {
            0% {
              opacity: 0;
              transform: translate(-50%, 0px) scale(0.3);
            }
            25% {
              opacity: 1;
              transform: translate(-50%, -8px) scale(1.4);
            }
            50% {
              opacity: 1;
              transform: translate(-50%, -16px) scale(1.5);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -40px) scale(1.2);
            }
          }
          .fa-level-up-float {
            will-change: transform, opacity;
            animation: faLevelUpFloat 2000ms ease-out forwards;
            font-weight: 900;
            font-size: 20px;
            background: linear-gradient(45deg, #a855f7, #3b82f6, #06b6d4);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 8px rgba(168, 85, 247, 0.8),
              0 0 16px rgba(59, 130, 246, 0.6), 0 4px 8px rgba(0, 0, 0, 1);
            filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.9));
          }

          @keyframes faBreath {
            0% {
              transform: scale(1);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.08);
              opacity: 0.5;
            }
            100% {
              transform: scale(1);
              opacity: 0.3;
            }
          }
          .fa-ring-pulse {
            position: absolute;
            inset: -4px;
            border-radius: 9999px;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35),
              inset 0 0 0 1px rgba(255, 255, 255, 0.12);
            animation: faBreath 2200ms ease-in-out infinite;
            pointer-events: none;
          }
          /* Upgrade buttons glow when points available */
          @keyframes faGlowPulse {
            0% {
              box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.5),
                0 0 0 0 rgba(255, 255, 255, 0.16);
            }
            50% {
              box-shadow: 0 0 0 6px rgba(20, 184, 166, 0.08),
                0 0 0 1.5px rgba(255, 255, 255, 0.2);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(20, 184, 166, 0),
                0 0 0 0 rgba(255, 255, 255, 0);
            }
          }
          .fa-upbtn-glow {
            animation: faGlowPulse 1.6s ease-in-out infinite;
          }
          .fa-upbtn {
            background-image: linear-gradient(
              to bottom right,
              rgba(20, 184, 166, 0.25),
              rgba(20, 184, 166, 0.15)
            );
            border-color: rgba(20, 184, 166, 0.4);
            color: rgb(153, 246, 228);
          }
          .fa-upbtn:hover {
            background-image: linear-gradient(
              to bottom right,
              rgba(20, 184, 166, 0.35),
              rgba(20, 184, 166, 0.25)
            );
          }
          .fa-upbtn:disabled {
            opacity: 0.6;
            filter: grayscale(0.2);
          }
          /* HP/Xp bar effects */
          .fa-hp-damage {
            background: radial-gradient(
              120px 80px at 50% 50%,
              rgba(255, 0, 0, 0.15),
              transparent 60%
            );
            animation: faHpDamage 280ms ease-out;
            pointer-events: none;
          }
          @keyframes faHpDamage {
            0% {
              opacity: 0.9;
            }
            100% {
              opacity: 0;
            }
          }
          .fa-hp-heal {
            background: radial-gradient(
              120px 80px at 50% 50%,
              rgba(16, 185, 129, 0.18),
              transparent 60%
            );
            animation: faHpHeal 320ms ease-out;
            pointer-events: none;
          }
          @keyframes faHpHeal {
            0% {
              opacity: 0.8;
            }
            100% {
              opacity: 0;
            }
          }
          .fa-xp-shimmer {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              120deg,
              transparent 0%,
              rgba(255, 255, 255, 0.18) 18%,
              transparent 36%
            );
            background-size: 220% 100%;
            opacity: 0;
            pointer-events: none;
          }
          .fa-xp-shimmer.is-on {
            animation: faXpShimmer 650ms ease-out forwards;
          }
          @keyframes faXpShimmer {
            0% {
              opacity: 0;
              background-position: 120% 0;
            }
            10% {
              opacity: 0.8;
            }
            100% {
              opacity: 0;
              background-position: -120% 0;
            }
          }
          .fa-xp-lvlup {
            animation: faXpPulse 700ms ease-out;
            box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.35) inset;
          }
          @keyframes faXpPulse {
            0% {
              filter: saturate(1) brightness(1);
            }
            50% {
              filter: saturate(1.4) brightness(1.2);
            }
            100% {
              filter: saturate(1) brightness(1);
            }
          }

          /* Level up glow effect */
          @keyframes faLevelUpGlow {
            0% {
              box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.6),
                0 0 0 0 rgba(255, 255, 255, 0.2);
              filter: brightness(1);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(20, 184, 166, 0.2),
                0 0 0 2px rgba(255, 255, 255, 0.3);
              filter: brightness(1.3);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(20, 184, 166, 0),
                0 0 0 0 rgba(255, 255, 255, 0);
              filter: brightness(1);
            }
          }
          .fa-level-up-glow {
            animation: faLevelUpGlow 2000ms ease-out;
          }

          /* Enhanced level up float */
          @keyframes faLevelUpFloat {
            0% {
              opacity: 0;
              transform: translate(-50%, 15px) scale(0.8);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, 5px) scale(1.2);
            }
            80% {
              opacity: 1;
              transform: translate(-50%, -15px) scale(1.1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -30px) scale(0.9);
            }
          }
          .fa-level-up-float {
            animation: faLevelUpFloat 2000ms ease-out;
            color: #14b8a6 !important;
            font-weight: 800;
            font-size: 18px;
            text-shadow: 0 0 6px rgba(20, 184, 166, 0.8),
              0 0 12px rgba(20, 184, 166, 0.4), 0 2px 4px rgba(0, 0, 0, 0.9);
            filter: drop-shadow(0 0 4px rgba(20, 184, 166, 0.6));
          }
          /* Skills trigger button */
          @keyframes faSkillGlow {
            0% {
              box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.35),
                0 0 0 0 rgba(255, 255, 255, 0.12);
            }
            50% {
              box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.06),
                0 0 0 1.5px rgba(255, 255, 255, 0.16);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(56, 189, 248, 0),
                0 0 0 0 rgba(255, 255, 255, 0);
            }
          }
          .fa-skillbtn {
            background-image: linear-gradient(
              to bottom right,
              rgba(99, 102, 241, 0.18),
              rgba(56, 189, 248, 0.12)
            );
            border-color: rgba(99, 102, 241, 0.35);
          }
          .fa-skillbtn:hover {
            background-image: linear-gradient(
              to bottom right,
              rgba(99, 102, 241, 0.26),
              rgba(56, 189, 248, 0.18)
            );
          }
          .fa-skillbtn-glow {
            animation: faSkillGlow 1.6s ease-in-out infinite;
          }
          /* Grid background for spawn container */
          .fa-grid {
            background-image: linear-gradient(
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px
              );
            background-size: 22px 22px, 22px 22px;
            background-position: -1px -1px, -1px -1px;
          }

          /* Enhanced damage number styles */
          .fa-damage-hero {
            color: #10b981 !important;
            text-shadow: 0 0 4px rgba(16, 185, 129, 0.8),
              0 0 8px rgba(16, 185, 129, 0.4), 0 1px 3px rgba(0, 0, 0, 0.9);
          }

          .fa-damage-enemy {
            color: #f87171 !important;
            text-shadow: 0 0 4px rgba(248, 113, 113, 0.8),
              0 0 8px rgba(248, 113, 113, 0.4), 0 1px 3px rgba(0, 0, 0, 0.9);
          }

          .fa-damage-heal {
            color: #4ade80 !important;
            text-shadow: 0 0 4px rgba(74, 222, 128, 0.8),
              0 0 8px rgba(74, 222, 128, 0.4), 0 1px 3px rgba(0, 0, 0, 0.9);
          }

          .fa-damage-gem {
            color: #67e8f9 !important;
            text-shadow: 0 0 4px rgba(103, 232, 249, 0.8),
              0 0 8px rgba(103, 232, 249, 0.4), 0 1px 3px rgba(0, 0, 0, 0.9);
          }
        `}</style>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-muted-foreground min-w-0">
            <HeaderIcon className="size-4 sm:size-5 shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">
              Fighter Arena
            </span>
          </div>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="shrink-0 text-xs sm:text-sm"
          >
            <Link href="/games">
              <span className="hidden sm:inline">Voltar aos jogos</span>
              <span className="sm:hidden">Voltar</span>
            </Link>
          </Button>
        </div>

        <Card className="border-muted/40">
          <CardContent className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 py-1 px-2 sm:px-6">
            <div className="flex items-center w-full sm:w-auto justify-center">
              <div className="inline-flex items-stretch divide-x rounded-lg border bg-background/60 ring-1 ring-inset ring-muted/30 shadow-sm">
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-7 sm:h-8">
                  <icons.Coins className="size-3 sm:size-4 text-yellow-400 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground/80">
                      Ouro
                    </div>
                    <div className="text-xs sm:text-sm tabular-nums font-semibold">
                      {gold}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-7 sm:h-8">
                  <icons.Gem className="size-3 sm:size-4 text-cyan-300 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground/80">
                      Gemas
                    </div>
                    <div className="text-xs sm:text-sm tabular-nums font-semibold">
                      {gems}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 flex-1 min-h-0 overflow-visible lg:overflow-hidden">
          <SectionCard
            className="border-muted/40"
            title="Seu Fighter"
            actions={
              [
                {
                  icon: icons.RotateCcw,
                  text: "Reiniciar",
                  variant: "destructive",
                  onClick: () => {
                    setIsRestartingToChooseClass(true);
                    setOpenClassSelection(true);
                  },
                },
              ] as SectionCardAction[]
            }
            contentClassName=""
          >
            <div className="space-y-4">
              <FighterCard
                heroClass={heroClass}
                level={level}
                heroHp={heroHp}
                heroMaxHp={heroMaxHp}
                attrs={attrs}
                heroHit={heroHit}
                levelUpGlow={levelUpGlow}
                fighterAnchorRef={fighterAnchorRef}
              />

              {/* Experiência */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">
                    Experiência
                  </span>
                  <span className="text-purple-400 font-medium">
                    {Math.round(xp * 100)}%
                  </span>
                </div>
                <div className="relative">
                  <XpBar value={xp} level={level} />
                </div>
              </div>

              {/* Atributos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-200">
                    Atributos
                  </h3>
                  {upPoints > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-slate-600/50 bg-slate-800/50 text-slate-300 text-xs font-medium backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                      {upPoints} {upPoints === 1 ? "ponto" : "pontos"}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {(
                    [
                      {
                        key: "STR",
                        label: "STR",
                        desc: "Força: aumenta dano base.",
                        color: "text-red-400",
                        bg: "from-red-500/10 to-orange-500/10",
                        border: "border-red-500/20",
                      },
                      {
                        key: "AGI",
                        label: "AGI",
                        desc: "Agilidade: aumenta ataques/segundo.",
                        color: "text-blue-400",
                        bg: "from-blue-500/10 to-cyan-500/10",
                        border: "border-blue-500/20",
                      },
                      {
                        key: "INT",
                        label: "INT",
                        desc: "Inteligência: aumenta dano e ouro.",
                        color: "text-purple-400",
                        bg: "from-purple-500/10 to-violet-500/10",
                        border: "border-purple-500/20",
                      },
                      {
                        key: "VIT",
                        label: "VIT",
                        desc: "Vitalidade: aumenta HP máximo.",
                        color: "text-green-400",
                        bg: "from-green-500/10 to-emerald-500/10",
                        border: "border-green-500/20",
                      },
                      {
                        key: "DEF",
                        label: "DEF",
                        desc: "Defesa: reduz dano recebido.",
                        color: "text-gray-400",
                        bg: "from-gray-500/10 to-slate-500/10",
                        border: "border-gray-500/20",
                      },
                      {
                        key: "LCK",
                        label: "LCK",
                        desc: "Sorte: aumenta chance de crítico.",
                        color: "text-yellow-400",
                        bg: "from-yellow-500/10 to-amber-500/10",
                        border: "border-yellow-500/20",
                      },
                    ] as const
                  ).map((attr) => (
                    <AttributeButton
                      key={attr.key}
                      attribute={attr}
                      value={attrs[attr.key]}
                      upPoints={upPoints}
                      onAddPoint={(key) => addPoint(key as keyof Attrs)}
                    />
                  ))}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {/* Primeira linha: 5 botões */}
                <Button
                  variant={isResting ? "default" : "secondary"}
                  className={`h-8 gap-2 hover:scale-[.98] transition-all duration-200 text-xs ${
                    isResting 
                      ? "bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-500/90 hover:to-emerald-500/90 border-green-500/30" 
                      : "bg-gradient-to-r from-slate-600/60 to-slate-700/60 hover:from-slate-500/70 hover:to-slate-600/70 border-slate-500/30"
                  }`}
                  onClick={() => {
                    toggleRest();
                    if (!isResting) {
                      toast.success("Descansando... Spawns pausados");
                    } else {
                      toast.success("Voltando à luta!");
                    }
                  }}
                >
                  <icons.Flame className="size-4" />
                  <span className="truncate font-medium">
                    {isResting ? "Parar" : "Descansar"}
                  </span>
                </Button>

                <Button
                  className="h-8 gap-2 hover:scale-[.98] transition-all duration-200 text-xs bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-500/90 hover:to-purple-500/90 border-violet-500/30"
                  disabled={!canUseSpecialAbility()}
                  onClick={() => {
                    const store = useArenaStore.getState();
                    const result = store.useSpecialAbility();
                    if (result === "ok") {
                      toast.success("Habilidade especial ativada!");
                    } else if (result === "cooldown") {
                      toast.error("Habilidade em cooldown");
                    }
                  }}
                >
                  <icons.Zap className="size-4 text-violet-100" />
                  <span className="truncate font-medium">
                    {specialAbility.isActive ? "Ativa" : "Especial"}
                  </span>
                </Button>

                <Button
                  variant="secondary"
                  className="h-8 gap-2 hover:scale-[.98] transition-all duration-200 text-xs bg-gradient-to-r from-blue-600/60 to-indigo-600/60 hover:from-blue-500/70 hover:to-indigo-500/70 border-blue-500/30"
                  onClick={() => setOpenSkills(true)}
                >
                  <icons.TrendingUp className="size-4 text-blue-200" />
                  <span className="font-medium text-white">Status</span>
                </Button>

                <Button
                  variant="secondary"
                  className="h-8 gap-2 hover:scale-[.98] transition-all duration-200 text-xs bg-gradient-to-r from-amber-600/60 to-orange-600/60 hover:from-amber-500/70 hover:to-orange-500/70 border-amber-500/30"
                  onClick={() => setOpenShop(true)}
                >
                  <icons.ShoppingBag className="size-4 text-amber-200" />
                  <span className="font-medium text-white">Loja</span>
                </Button>

                <Button
                  variant="secondary"
                  className="h-8 gap-2 hover:scale-[.98] transition-all duration-200 text-xs bg-gradient-to-r from-emerald-600/60 to-green-600/60 hover:from-emerald-500/70 hover:to-green-500/70 border-emerald-500/30 relative"
                  onClick={() => setOpenInventory(true)}
                >
                  <icons.Package className="size-4 text-emerald-200" />
                  <span className="font-medium text-white">Inventário</span>
                  {inventory.health_potions > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {inventory.health_potions}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            className="border-muted/40"
            title={
              <span className="text-xs sm:text-sm">Arena de Monstros</span>
            }
            actions={[
              {
                icon: icons.Skull,
                text: "Spawn",
                onClick: () => {
                  const r = useArenaStore.getState().spawnEnemy();
                  if (r === "ok") toast.success("Monstro gerado");
                  else toast("Limite de 10 atingido");
                },
              },
            ]}
            contentClassName="h-full flex flex-col overflow-visible lg:overflow-auto"
          >
            <div ref={arenaRef} className="relative flex-1 flex flex-col">
              {/* Floats renderizados apenas para enemies dentro da arena */}
              <div className="absolute inset-0 pointer-events-none select-none z-20">
                {floats
                  .filter((f) => f.target === "enemy" || f.target === "misc")
                  .map((f) => {
                    const p = floatPos[f.id];
                    const getDamageClass = () => {
                      if (f.color === "crit")
                        return "fa-float-crit text-yellow-300";
                      if (f.color === "hero") return "fa-float fa-damage-hero";
                      if (f.color === "enemy")
                        return "fa-float fa-damage-enemy";
                      if (f.color === "heal") return "fa-float fa-damage-heal";
                      if (f.text.includes("💎"))
                        return "fa-float fa-damage-gem";
                      return "fa-float";
                    };

                    return (
                      <span
                        key={f.id}
                        className={`absolute left-0 top-0 ${getDamageClass()}`}
                        style={{
                          left: (p ? p.x : 0) + "px",
                          top: (p ? p.y : 0) + "px",
                          transform: `translate(-50%, -10px)`,
                          pointerEvents: "none",
                          opacity: 0.98,
                          fontSize: f.color === "crit" ? "16px" : "14px",
                          fontWeight: f.color === "crit" ? "800" : "700",
                        }}
                      >
                        {f.text}
                      </span>
                    );
                  })}
              </div>

              <div className="rounded-xl border-2 border-dashed border-slate-600/40 bg-gradient-to-br from-slate-800/20 to-slate-900/20 ring-1 ring-inset ring-slate-700/30 p-3 sm:p-4 flex-1 flex flex-col fa-grid backdrop-blur-sm">
                {enemies.length === 0 ? (
                  <div className="py-12 sm:py-16 text-center text-sm sm:text-base text-slate-400">
                    <div className="flex items-center justify-center gap-3">
                      <icons.Skull className="size-4 sm:size-5 opacity-70" />
                      <span>Monstros spawnam aqui...</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {enemies.map((e) => (
                      <MonsterCard
                        key={e.id}
                        enemy={e}
                        isHit={monsterHits.has(e.id)}
                        enemyRef={(el) => {
                          enemyRefs.current[e.id] = el;
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div aria-live="polite" className="sr-only" />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
