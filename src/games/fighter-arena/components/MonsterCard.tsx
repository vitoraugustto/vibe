import { Badge, Tooltip, TooltipContent, TooltipTrigger } from "@/components";
import { HpBar } from "./Bars";
import { MonsterManager, type MonsterId } from "../monsters";

type Enemy = {
  id: string;
  name: string;
  emoji: string;
  level: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  rarity: "common" | "elite" | "berserk";
  monsterId: MonsterId;
};

interface MonsterCardProps {
  enemy: Enemy;
  isHit: boolean;
  enemyRef: (el: HTMLDivElement | null) => void;
}

export function MonsterCard({ enemy: e, isHit, enemyRef }: MonsterCardProps) {
  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case "elite":
        return {
          ring: "ring-yellow-500/40 hover:ring-yellow-500/60",
          bg: "bg-yellow-500/5",
          text: "text-yellow-400",
        };
      case "berserk":
        return {
          ring: "ring-red-500/40 hover:ring-red-500/60",
          bg: "bg-red-500/5",
          text: "text-red-400",
        };
      default:
        return {
          ring: "ring-slate-600/40 hover:ring-slate-500/60",
          bg: "bg-slate-600/5",
          text: "text-slate-400",
        };
    }
  };

  const rarityStyles = getRarityStyles(e.rarity);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group rounded-lg p-[1px] bg-slate-800/40 border border-slate-700/60 cursor-help transition-all duration-200 hover:border-slate-600/80">
          <div
            className={`rounded-[7px] bg-slate-900/60 backdrop-blur-sm ring-1 ring-inset ${rarityStyles.ring} ${rarityStyles.bg} transition-all duration-200`}
          >
            <div className="p-3 flex items-center gap-3">
              <div
                ref={enemyRef}
                className={`relative size-10 rounded-full bg-slate-800/80 border border-slate-600/60 flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isHit ? "fa-hit-flash" : ""
                } group-hover:border-slate-500/80`}
              >
                <span className="text-lg drop-shadow-sm">{e.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-slate-200 truncate">
                    {e.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge
                      variant="secondary"
                      className="h-5 px-2 text-xs font-medium bg-slate-700/80 border-slate-600/50 text-slate-300"
                    >
                      Lv {e.level}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`h-5 px-2 text-xs font-medium uppercase ${rarityStyles.text} border-current/40 bg-current/10`}
                    >
                      {e.rarity}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Vida</span>
                    <span className="tabular-nums font-medium text-slate-300">
                      {Math.max(0, Math.round(e.hp))} / {Math.round(e.maxHp)}
                    </span>
                  </div>
                  <HpBar current={e.hp} max={e.maxHp} height={5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm bg-slate-900/95 border-slate-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{e.emoji}</span>
            <div>
              <div className="font-semibold text-slate-100">{e.name}</div>
              <div className="text-xs text-slate-400 capitalize">
                {e.rarity} • Nível {e.level}
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-300">
            {MonsterManager.getMonster(e.monsterId).description}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">HP:</span>
              <span className="font-medium text-slate-200">
                {Math.round(e.hp)} / {Math.round(e.maxHp)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dano:</span>
              <span className="font-medium text-red-400">{e.damage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Velocidade:</span>
              <span className="font-medium text-blue-400">
                {(1 / e.speed).toFixed(1)}x
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">HP Base:</span>
              <span className="font-medium text-green-400">
                {MonsterManager.getMonster(e.monsterId).baseHp}
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-700">
            <div className="text-xs text-slate-400">
              <strong>Level Range:</strong>{" "}
              {MonsterManager.getMonster(e.monsterId).levelRange.min}-
              {MonsterManager.getMonster(e.monsterId).levelRange.max} •
              <strong> Spawn:</strong>{" "}
              {MonsterManager.getMonster(e.monsterId).rarityWeights[e.rarity]}%{" "}
              {e.rarity}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
