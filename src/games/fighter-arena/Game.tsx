"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useArenaStore } from "@/games/fighter-arena/state";
import {
  apsFromAGI,
  heroBaseDamage,
  critChancePct,
  maxHpFromVIT,
  goldMultFromINT,
  gemChancePct,
} from "@/games/fighter-arena/logic";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Progress,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Separator,
} from "@/components";
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
    spawnEnemy,
    countCommon,
    countElite,
    countBerserk,
    heroHp,
    heroMaxHp,
    floats,
    startCombatLoop,
  } = useArenaStore();
  const [openReroll, setOpenReroll] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);

  useEffect(() => {
    const dispose = startCombatLoop();
    return () => dispose();
  }, [startCombatLoop]);

  const Icon = (icons as Record<string, LucideIcon>)["Swords"] || icons["Gamepad"];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-5" />
          <span className="font-semibold">Fighter Arena</span>
        </div>
        <Button asChild variant="secondary">
          <Link href="/games">Voltar aos jogos</Link>
        </Button>
      </div>

      <Card className="border-muted/40">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <span className="text-yellow-300">💰</span>
            <span className="font-semibold">Ouro</span>
            <span className="text-muted-foreground">{gold}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-300">💎</span>
            <span className="font-semibold">Gemas</span>
            <span className="text-muted-foreground">{gems}</span>
          </div>

          <Sheet open={openReroll} onOpenChange={setOpenReroll}>
            <SheetTrigger asChild>
              <Button variant="destructive" className="hover:scale-[.99] transition will-change-transform">↻ Rerrolar</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Confirmar Rerrol</SheetTitle>
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-muted/40">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-sm">{heroClass}</Badge>
              <span className="text-sm text-muted-foreground">LVL {level}</span>
            </CardTitle>
            <CardDescription>Seu herói principal</CardDescription>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
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
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between"><span>APS</span><span className="font-medium text-foreground">{apsFromAGI(attrs.AGI).toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span>Dano médio</span><span className="font-medium text-foreground">{Math.round(heroBaseDamage(attrs))}</span></div>
                <div className="flex items-center justify-between"><span>Crítico</span><span className="font-medium text-foreground">{critChancePct(attrs.LCK).toFixed(1)}%</span></div>
                <div className="flex items-center justify-between"><span>HP Máx</span><span className="font-medium text-foreground">{Math.round(maxHpFromVIT(attrs.VIT))}</span></div>
                <div className="flex items-center justify-between"><span>x Ouro</span><span className="font-medium text-foreground">{goldMultFromINT(attrs.INT).toFixed(2)}x</span></div>
                <div className="flex items-center justify-between"><span>Chance de 💎</span><span className="font-medium text-foreground">{gemChancePct(level, attrs.LCK, attrs.INT).toFixed(1)}%</span></div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                aria-label="Forjar"
                className="hover:scale-[.99] transition"
                onClick={() => {
                  const before = gold;
                  // tentativa de forja
                  forge();
                  const after = useArenaStore.getState().gold;
                  if (after < before) {
                    toast.success("Forja concluída: +1 em todos os atributos");
                  } else {
                    toast.error("Ouro insuficiente para forjar");
                  }
                }}
              >
                Forjar (💰 {getForgeCost()})
              </Button>
              <Sheet open={openSkills} onOpenChange={setOpenSkills}>
                <SheetTrigger asChild>
                  <Button variant="secondary" className="hover:scale-[.99] transition">Habilidades</Button>
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
          </CardContent>
        </Card>

        <Card className="border-muted/40">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="flex items-center justify-between w-full">
              <span>Arena de Monstros</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Comuns: {countCommon()}</span>
                <span>Elite: {countElite()}</span>
                <span>Berserk: {countBerserk()}</span>
              </div>
            </CardTitle>
            <CardDescription>Spawns e batalhas acontecem aqui</CardDescription>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs">HP do Herói:</span>
              <Progress value={heroHp / heroMaxHp * 100} className="flex-1 h-2" />
              <span className="text-xs">{Math.round(heroHp)} / {Math.round(heroMaxHp)}</span>
            </div>
          </CardHeader>
          <CardContent className="py-6 space-y-4 relative">
            <Button
              aria-label="Gerar Monstro"
              onClick={() => {
                const r = spawnEnemy();
                if (r === "ok") toast.success("Monstro gerado");
                else toast("Limite de 10 atingido");
              }}
              className="hover:scale-[.99] transition"
            >
              Gerar Monstro
            </Button>

            {/* Floating numbers */}
            <div className="absolute inset-0 pointer-events-none select-none z-20">
              {floats.map((f) => (
                <span
                  key={f.id}
                  className={
                    `absolute left-0 top-0 animate-[float_700ms_ease-out_forwards] ` +
                    (f.color === "crit"
                      ? "text-yellow-300 font-semibold drop-shadow"
                      : f.color === "hero"
                      ? "text-emerald-300"
                      : f.color === "enemy"
                      ? "text-red-400"
                      : "text-green-400")
                  }
                  style={{
                    transform: `translate(${f.x}%, ${f.y}%)`,
                    pointerEvents: "none",
                  }}
                >
                  {f.text}
                </span>
              ))}
            </div>

            {/* Arena grid or placeholder */}
            {enemies.length === 0 ? (
              <Card className="border-dashed border-muted/40">
                <CardContent className="py-16 text-center text-sm text-muted-foreground">
                  Spawns automáticos ativos…
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {enemies.map((e) => (
                  <Card key={e.id} className="p-3 flex items-center gap-2">
                    <span className="text-lg" aria-hidden>{e.emoji}</span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{e.name}</span>
                      <span className={"text-xs " + (e.rarity === "elite" ? "text-yellow-300" : e.rarity === "berserk" ? "text-red-400" : "text-muted-foreground")}>{e.rarity}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {/* Aria-live region for accessibility */}
            <div aria-live="polite" className="sr-only" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
