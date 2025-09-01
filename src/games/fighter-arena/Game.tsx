"use client";

import Link from "next/link";
import { useState } from "react";
import { useArenaStore } from "@/games/fighter-arena/state";
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
  const { gold, gems, heroClass, level, xp, hasNecromancy, reroll } = useArenaStore();
  const [openReroll, setOpenReroll] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);

  const TooltipStat = ({ code, desc }: { code: string; desc: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help select-none rounded-sm px-1 py-0.5 hover:bg-muted/50 transition">{code}</span>
      </TooltipTrigger>
      <TooltipContent>{desc}</TooltipContent>
    </Tooltip>
  );

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

            <div className="flex flex-wrap gap-2 text-xs">
              <TooltipStat code="STR" desc="Força: dano físico e carga." />
              <TooltipStat code="AGI" desc="Agilidade: velocidade e evasão." />
              <TooltipStat code="INT" desc="Inteligência: dano mágico e mana." />
              <TooltipStat code="VIT" desc="Vitalidade: vida máxima e regen." />
              <TooltipStat code="DEF" desc="Defesa: redução de dano." />
              <TooltipStat code="LCK" desc="Sorte: crítico e drops." />
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
                      Configuração de skills virá depois.
                    </SheetDescription>
                  </SheetHeader>
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
