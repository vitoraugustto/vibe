"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useArenaStore } from "@/games/fighter-arena/state";
import { gameMeta } from "@/games/fighter-arena/meta";
import {
  apsFromAGI,
  heroBaseDamage,
  critChancePct,
  maxHpFromVIT,
  goldMultFromINT,
  gemChancePct,
} from "@/games/fighter-arena/logic";
import { Button, Card, CardContent, Badge, Progress, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger, Tooltip, TooltipContent, TooltipTrigger, Separator } from "@/components";
import { SectionCard, type SectionCardAction } from "./components/SectionCard";
import { icons, LucideIcon } from "lucide-react";
import { toast } from "sonner";

export default function Game() {
  const {
    gold,
    gems,
    heroClass,
    level,
    xp,
    hasNecromancy,
    attrs,
    upPoints,
    addPoint,
    reroll,
    getForgeCost,
    forge,
    buyNecromancy,
    enemies,
    heroHp,
    heroMaxHp,
    floats,
    startCombatLoop,
  } = useArenaStore();

  const [openReroll, setOpenReroll] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const fighterAnchorRef = useRef<HTMLDivElement | null>(null);
  const enemyRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [floatPos, setFloatPos] = useState<Record<string, { x: number; y: number }>>({});
  const posMapRef = useRef<Record<string, { x: number; y: number }>>({});
  const [heroHit, setHeroHit] = useState(false);
  const [monsterHits, setMonsterHits] = useState<Set<string>>(new Set());
  const lastFloatIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const dispose = startCombatLoop();
    return () => dispose();
  }, [startCombatLoop]);

  useEffect(() => {
    const container = arenaRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const current = posMapRef.current;

    const next: Record<string, { x: number; y: number }> = {};
    const seen = new Set<string>();

    const offsetFromId = (id: string) => {
      let h = 0;
      for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
      const jx = ((h % 100) / 100 - 0.5) * 18;
      const jy = ((((h >>> 8) % 100) / 100) - 0.5) * 12;
      return { jx, jy };
    };

    for (const f of floats) {
      seen.add(f.id);
      if (current[f.id]) {
        next[f.id] = current[f.id];
        continue;
      }
      let targetEl: HTMLElement | null = null;
      if (f.target === "enemy" && f.targetId) {
        targetEl = (enemyRefs.current[f.targetId] as HTMLElement) || null;
      } else if (f.target === "hero") {
        targetEl = fighterAnchorRef.current as HTMLElement | null;
      } else {
        targetEl = container;
      }
      if (!targetEl) continue;
      const r = targetEl.getBoundingClientRect();
      const cx = r.left - cRect.left + r.width / 2;
      const cy = r.top - cRect.top + r.height / 2;
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
        }
      }
    }
    lastFloatIdsRef.current = current;
  }, [floats]);

  function HitSparks({ count = 6 }: { count?: number }) {
    const items = Array.from({ length: count }).map((_, i) => {
      const l = 10 + Math.random() * 80;
      const t = 10 + Math.random() * 70;
      return <span key={i} className="fa-spark" style={{ left: `${l}%`, top: `${t}%` }} />;
    });
    return <div className="pointer-events-none absolute inset-0 overflow-hidden">{items}</div>;
  }

  const HeaderIcon = (icons as Record<string, LucideIcon>)[gameMeta.icon] || (icons as Record<string, LucideIcon>)["Swords"] || icons["Gamepad"];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-4 min-h-[100svh] md:h-screen overflow-auto md:overflow-hidden flex flex-col">
      <style jsx global>{`
        @keyframes faHitFlash { 0% { filter: brightness(1); } 50% { filter: brightness(1.6); } 100% { filter: brightness(1); } }
        .fa-hit-flash { animation: faHitFlash 220ms ease-in-out; }
        @keyframes faFloatUp { 0% { opacity: 0; transform: translate(-50%, 8px) scale(0.95); } 20% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -14px) scale(1); } }
        .fa-float { will-change: transform, opacity; animation: faFloatUp 900ms ease-out forwards; }
        @keyframes faCritPop { 0% { opacity: 0.25; transform: translate(-50%, 6px) scale(0.9); } 40% { opacity: 1; transform: translate(-50%, -4px) scale(1.22); } 100% { opacity: 0; transform: translate(-50%, -16px) scale(1); } }
        .fa-float-crit { will-change: transform, opacity; animation: faCritPop 950ms ease-out forwards; }
        @keyframes faSparkOut { 0% { opacity: 1; transform: translate(0, 0) scale(1); } 100% { opacity: 0; transform: translate(0, -8px) scale(0.8); } }
  .fa-spark { position: absolute; width: 6px; height: 6px; border-radius: 9999px; background: radial-gradient(circle, rgba(255,255,255,1), rgba(103,232,249,0.9)); animation: faSparkOut 420ms ease-out forwards; }
  @keyframes faBreath { 0% { transform: scale(1); opacity: .25; } 50% { transform: scale(1.06); opacity: .45; } 100% { transform: scale(1); opacity: .25; } }
  .fa-ring-pulse { position: absolute; inset: -4px; border-radius: 9999px; box-shadow: 0 0 0 2px rgba(59,130,246,0.35), inset 0 0 0 1px rgba(255,255,255,0.12); animation: faBreath 2200ms ease-in-out infinite; pointer-events: none; }
  /* Grid background for spawn container */
        .fa-grid { background-image:
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 22px 22px, 22px 22px;
          background-position: -1px -1px, -1px -1px;
        }
      `}</style>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HeaderIcon className="size-5" />
          <span className="font-semibold">Fighter Arena</span>
        </div>
        <Button asChild variant="secondary">
          <Link href="/games">Voltar aos jogos</Link>
        </Button>
      </div>

      <Card className="border-muted/40">
        <CardContent className="flex flex-wrap items-center justify-end gap-3 py-1">
          <div className="flex items-center">
            <div className="inline-flex items-stretch divide-x rounded-lg border bg-background/60 ring-1 ring-inset ring-muted/30 shadow-sm">
              <div className="flex items-center gap-2 px-3 h-8">
                <icons.Coins className="size-4 text-yellow-400" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground/80">Ouro</div>
                  <div className="text-sm tabular-nums font-semibold">{gold}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 h-8">
                <icons.Gem className="size-4 text-cyan-300" />
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground/80">Gemas</div>
                  <div className="text-sm tabular-nums font-semibold">{gems}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-visible md:overflow-hidden">
        {/* Reroll sheet lives here so header action button can just open it */}
        <Sheet open={openReroll} onOpenChange={setOpenReroll}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Confirmar Reinício</SheetTitle>
              <SheetDescription>
                Você perderá o herói atual — atributos/skills/XP. Ouro, Gemas e Arena permanecem.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  reroll();
                  setOpenReroll(false);
                }}
              >
                Confirmar
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <SectionCard
          className="border-muted/40"
          title={<><Badge variant="secondary" className="rounded-sm">{heroClass}</Badge><span className="text-sm text-muted-foreground">LVL {level}</span></>}
          actions={([
            {
              icon: icons.RotateCcw,
              text: "Reiniciar",
              variant: "destructive",
              onClick: () => setOpenReroll(true),
            },
          ]) as SectionCardAction[]}
          contentClassName=""
        >
          <div className="space-y-3">
            <div className="rounded-lg p-[1.5px] bg-gradient-to-br from-white/5 via-muted/30 to-white/5">
              <div className="rounded-[10px] border border-border/50 ring-1 ring-inset ring-muted/30 bg-background/60 shadow-sm p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div ref={fighterAnchorRef} className={`relative size-10 rounded-full bg-muted/50 border flex items-center justify-center ${heroHit ? "fa-hit-flash" : ""}`} aria-hidden>
                      <span className="fa-ring-pulse" />
                      {heroHit && <HitSparks count={5} />}
                      <HeaderIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold">Fighter</div>
                      <div className="text-[11px] text-muted-foreground">{heroClass} • Nível {level}</div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"><span className="text-muted-foreground">APS</span><span className="font-semibold text-foreground">{apsFromAGI(attrs.AGI).toFixed(2)}</span></div>
                    <div className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"><span className="text-muted-foreground">DMG</span><span className="font-semibold text-foreground">{Math.round(heroBaseDamage(attrs))}</span></div>
                    <div className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"><span className="text-muted-foreground">CRIT</span><span className="font-semibold text-foreground">{critChancePct(attrs.LCK).toFixed(1)}%</span></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">HP</span>
                  <Progress value={(heroHp / heroMaxHp) * 100} className="h-2 flex-1" />
                  <span className="text-[11px] tabular-nums">{Math.round(heroHp)} / {Math.round(heroMaxHp)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Experiência</span>
                <span className="text-muted-foreground">{Math.round(xp * 100)}%</span>
              </div>
              <Progress value={xp * 100} />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Atributos {upPoints > 0 && <span className="text-muted-foreground">(+{upPoints})</span>}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {([
                { key: "STR", label: "STR", desc: "Força: aumenta dano base." },
                { key: "AGI", label: "AGI", desc: "Agilidade: aumenta ataques/segundo (reduz cooldown exponencialmente)." },
                { key: "INT", label: "INT", desc: "Inteligência: aumenta dano e multiplica ouro; melhora chance de 💎." },
                { key: "VIT", label: "VIT", desc: "Vitalidade: aumenta HP máx (~+14/pt)." },
                { key: "DEF", label: "DEF", desc: "Defesa: reduz dano recebido." },
                { key: "LCK", label: "LCK", desc: "Sorte: aumenta chance de crítico e de 💎." },
              ] as const).map((a) => (
                <div key={a.key} className="flex items-center justify-between rounded-md border px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-medium">{a.label}</span>
                      </TooltipTrigger>
                      <TooltipContent>{a.desc}</TooltipContent>
                    </Tooltip>
                    <span className="text-muted-foreground">{attrs[a.key]}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-label={`Aumentar ${a.key}`}
                    disabled={upPoints <= 0}
                    onClick={() => addPoint(a.key)}
                  >
                    +
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="my-2" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Atributos Atuais</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between"><span>HP Máx</span><span className="font-medium text-foreground">{Math.round(maxHpFromVIT(attrs.VIT))}</span></div>
                <div className="flex items-center justify-between"><span>x Ouro</span><span className="font-medium text-foreground">{goldMultFromINT(attrs.INT).toFixed(2)}x</span></div>
                <div className="flex items-center justify-between"><span>Chance de 💎</span><span className="font-medium text-foreground">{gemChancePct(level, attrs.LCK, attrs.INT).toFixed(1)}%</span></div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                aria-label="Forjar"
                className="h-8 gap-2 hover:scale-[.99] transition"
                onClick={() => {
                  const before = gold;
                  forge();
                  const after = useArenaStore.getState().gold;
                  if (after < before) {
                    toast.success("Forja concluída: +1 em todos os atributos");
                  } else {
                    toast.error("Ouro insuficiente para forjar");
                  }
                }}
              >
                <icons.Hammer className="size-4" />
                <span>Forjar (💰 {getForgeCost()})</span>
              </Button>
              <Sheet open={openSkills} onOpenChange={setOpenSkills}>
                <SheetTrigger asChild>
                  <Button variant="secondary" className="h-8 gap-2 hover:scale-[.99] transition">
                    <icons.Wand className="size-4" />
                    <span>Habilidades</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Habilidades do Herói</SheetTitle>
                    <SheetDescription>
                      As habilidades serão configuráveis em breve. Abaixo, ideias em placeholder:
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-4 pb-4 space-y-3 text-sm">
                    <div>
                      <div className="font-medium">Duplicar status</div>
                      <div className="text-muted-foreground">Duplica um atributo escolhido — máx 3 usos.</div>
                    </div>
                    <div>
                      <div className="font-medium">Voltar à Vida (Revive)</div>
                      <div className="text-muted-foreground">Ressuscita o herói — até 3 cargas.</div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">Necromante</div>
                        <div className="text-muted-foreground">Converte mortos em aliados. Custa 1 💎.</div>
                      </div>
                      <Button
                        aria-label="Ativar Necromante"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const res = buyNecromancy();
                          if (res === "ok") toast.success("Necromancia ativada");
                          else if (res === "no-gems") toast.error("Você precisa de 1 💎");
                          else toast("Já está ativo");
                        }}
                      >
                        Ativar
                      </Button>
                    </div>
                    <div>
                      <div className="font-medium">Regeneração</div>
                      <div className="text-muted-foreground">0,4% do HP máx × nível por segundo.</div>
                    </div>
                    <div>
                      <div className="font-medium">Sanguessuga (Lifesteal)</div>
                      <div className="text-muted-foreground">2% × nível do dano causado.</div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {hasNecromancy && (
              <div className="pt-4">
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Aliados (Necromancia)</h3>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <Card className="border-dashed border-muted/40">
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                      Aliados surgirão de inimigos derrotados…
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

  <SectionCard
          className="border-muted/40"
          title={<span className="text-sm">Arena de Monstros</span>}
          actions={([
            {
              icon: icons.Skull,
              text: "Spawn",
              onClick: () => {
                const r = useArenaStore.getState().spawnEnemy();
                if (r === "ok") toast.success("Monstro gerado");
                else toast("Limite de 10 atingido");
              },
            },
          ])}
          contentClassName="h-full flex flex-col overflow-visible md:overflow-auto"
        >
            <div ref={arenaRef} className="relative flex-1 flex flex-col">
              {/* hero anchor now points to Fighter avatar outside; kept overlay simple */}
              <div className="absolute inset-0 pointer-events-none select-none z-20">
                {floats.map((f) => {
                  const p = floatPos[f.id];
                  return (
                    <span
                      key={f.id}
                      className={`absolute left-0 top-0 ${f.color === "crit" ? "fa-float-crit text-yellow-300 font-semibold drop-shadow" : "fa-float"} ${
                        f.color === "hero" ? "text-emerald-300" : f.color === "enemy" ? "text-red-400" : f.color === "heal" ? "text-green-400" : "text-foreground"
                      }`}
                      style={{
                        left: (p ? p.x : 0) + "px",
                        top: (p ? p.y : 0) + "px",
                        transform: `translate(-50%, -10px)`,
                        pointerEvents: "none",
                        opacity: 0.95,
                      }}
                    >
                      {f.text}
                    </span>
                  );
                })}
              </div>

              <div className="rounded-xl border-2 border-dashed border-muted-foreground/40 bg-muted/5 ring-1 ring-inset ring-muted/30 p-3 flex-1 flex flex-col fa-grid">
              {enemies.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <icons.Skull className="size-4 opacity-70" />
                    <span>Monstros spawnam aqui...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {enemies.map((e) => {
                    const rarityRing = e.rarity === "elite" ? "ring-yellow-500/25 hover:ring-yellow-500/35 bg-yellow-500/5" : e.rarity === "berserk" ? "ring-red-500/25 hover:ring-red-500/35 bg-red-500/5" : "ring-muted/30 hover:ring-muted/40 bg-muted/10";
                    const rarityText = e.rarity === "elite" ? "text-yellow-300" : e.rarity === "berserk" ? "text-red-400" : "text-muted-foreground";
                    return (
                      <div key={e.id} className="rounded-lg p-[1.5px] bg-gradient-to-br from-white/5 via-muted/30 to-white/5 transition hover:translate-y-[1px]">
                        <div className={`rounded-[12px] border border-border/50 ring-1 ring-inset shadow-sm hover:shadow-md ${rarityRing}`}>
                          <div className="p-3 flex sm:items-center gap-3">
                          <div
                            ref={(el) => { enemyRefs.current[e.id] = el; }}
                            className={`relative size-12 sm:size-10 rounded-full bg-background/60 border flex items-center justify-center shrink-0 ${monsterHits.has(e.id) ? "fa-hit-flash" : ""}`}
                            aria-hidden
                          >
                            {monsterHits.has(e.id) && <HitSparks />}
                            <span className="text-lg">{e.emoji}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <span className="text-sm font-medium truncate">{e.name}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                {typeof e.level === "number" && (
                                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">LVL {e.level}</Badge>
                                )}
                                <Badge variant="outline" className={`h-5 px-1.5 text-[10px] uppercase ${rarityText}`}>{e.rarity}</Badge>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Vida</span>
                                <span className="tabular-nums">{Math.max(0, Math.round(e.hp))} / {Math.round(e.maxHp)}</span>
                              </div>
                              <Progress value={(e.hp / e.maxHp) * 100} className="h-2" />
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
              <div aria-live="polite" className="sr-only" />
      </div>
    </SectionCard>
      </div>
    </div>
  );
}
