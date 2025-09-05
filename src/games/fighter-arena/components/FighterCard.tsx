import { useRef } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components";
import { HpBar } from "./Bars";
import { HeroClassManager } from "../classes";
import { getClassIcon, getClassColor } from "./ClassSelectionModal";
import {
  apsFromAGI,
  heroBaseDamage,
  critChancePct,
  type Attrs,
} from "../logic";
import type { ClassId } from "../classes";
import { icons } from "lucide-react";

interface FighterCardProps {
  heroClass: ClassId;
  level: number;
  attrs: Attrs;
  heroHp: number;
  heroMaxHp: number;
  heroHit?: boolean;
  levelUpGlow?: boolean;
  fighterAnchorRef?: React.RefObject<HTMLDivElement | null>;
}

export function FighterCard({
  heroClass,
  level,
  attrs,
  heroHp,
  heroMaxHp,
  heroHit = false,
  levelUpGlow = false,
  fighterAnchorRef,
}: FighterCardProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = fighterAnchorRef || localRef;

  const heroIconKey = getClassIcon(heroClass);
  const HeroIcon = icons[heroIconKey];
  const heroClassColor = getClassColor(heroClass);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group rounded-lg p-[1px] bg-slate-800/40 border border-slate-700/60 cursor-help transition-all duration-200 hover:border-slate-600/80">
          <div className="rounded-[7px] bg-slate-900/60 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  ref={ref}
                  className={`relative size-10 rounded-full bg-slate-800/80 border border-slate-600/60 flex items-center justify-center shrink-0 transition-all duration-200 ${
                    heroHit ? "fa-hit-flash" : ""
                  } ${
                    levelUpGlow ? "fa-level-up-glow" : ""
                  } group-hover:border-slate-500/80`}
                >
                  <HeroIcon className={`size-5 ${heroClassColor}`} />
                </div>
                <div className="leading-tight min-w-0">
                  <div className="text-sm font-medium text-slate-200">
                    Fighter
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {HeroClassManager.getClass(heroClass).name} • Lv {level}
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/50 bg-slate-800/50 px-2 py-1 text-xs">
                  <span className="text-slate-400">APS</span>
                  <span className="font-medium text-blue-400">
                    {apsFromAGI(attrs.AGI).toFixed(2)}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/50 bg-slate-800/50 px-2 py-1 text-xs">
                  <span className="text-slate-400">DMG</span>
                  <span className="font-medium text-red-400">
                    {Math.round(heroBaseDamage(attrs))}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-600/50 bg-slate-800/50 px-2 py-1 text-xs">
                  <span className="text-slate-400">CRIT</span>
                  <span className="font-medium text-yellow-400">
                    {critChancePct(attrs.LCK).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">HP</span>
              <div className="flex-1">
                <HpBar current={heroHp} max={heroMaxHp} height={6} />
              </div>
              <span className="text-xs tabular-nums text-slate-300">
                {Math.round(heroHp)} / {Math.round(heroMaxHp)}
              </span>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm bg-slate-900/95 border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HeroIcon className={`size-5 ${heroClassColor}`} />
            <div>
              <div className="font-semibold text-slate-100">Fighter</div>
              <div className="text-xs text-slate-400">
                {HeroClassManager.getClass(heroClass).name} • Nível {level}
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-300">
            {HeroClassManager.getClass(heroClass).description}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">HP:</span>
              <span className="font-medium text-slate-200">
                {Math.round(heroHp)} / {Math.round(heroMaxHp)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dano Base:</span>
              <span className="font-medium text-red-400">
                {Math.round(heroBaseDamage(attrs))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">APS:</span>
              <span className="font-medium text-blue-400">
                {apsFromAGI(attrs.AGI).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Crítico:</span>
              <span className="font-medium text-yellow-400">
                {critChancePct(attrs.LCK).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Defesa:</span>
              <span className="font-medium text-green-400">{attrs.DEF}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">XP:</span>
              <span className="font-medium text-purple-400">
                {Math.round(heroHp * 100)}%
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-700">
            <div className="text-xs text-slate-400">
              <strong>Atributos:</strong> STR {attrs.STR} • AGI {attrs.AGI} •
              INT {attrs.INT} • VIT {attrs.VIT} • DEF {attrs.DEF} • LCK{" "}
              {attrs.LCK}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
