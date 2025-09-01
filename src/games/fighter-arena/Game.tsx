"use client";

import Link from "next/link";
import { useState } from "react";
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
  const { gold, gems, heroClass, level, xp, hasNecromancy, attrs, upPoints, addPoint, reroll } = useArenaStore();
  const [openReroll, setOpenReroll] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);

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
              <Button className="hover:scale-[.99] transition">Forjar</Button>
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
                    <div>
                      <div className="font-medium">Necromante</div>
                      <div className="text-muted-foreground">Chance de converter inimigos mortos em aliados.</div>
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
                      Espaço reservado para aliados…
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
                <span>Comuns: 0</span>
                <span>Elite: 0</span>
                <span>Berserk: 0</span>
              </div>
            </CardTitle>
            <CardDescription>Spawns e batalhas acontecem aqui</CardDescription>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            <Button
              onClick={() => {
                toast("Placeholder: Gerar Monstro", {
                  description: "O sistema de spawns será implementado depois.",
                });
              }}
              className="hover:scale-[.99] transition"
            >
              Gerar Monstro
            </Button>
            <Card className="border-dashed border-muted/40">
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Spawns automáticos ativos…
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
