import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@/components";
import { icons } from "lucide-react";

interface AttributeButtonProps {
  attribute: {
    key: string;
    label: string;
    desc: string;
    color: string;
    bg: string;
    border: string;
  };
  value: number;
  upPoints: number;
  onAddPoint: (key: string) => void;
}

export function AttributeButton({
  attribute: a,
  value,
  upPoints,
  onAddPoint,
}: AttributeButtonProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border ${a.border} px-3 py-2 min-w-0 bg-slate-800/40 transition-all duration-200 hover:bg-slate-800/60`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`cursor-help font-medium text-sm ${a.color}`}>
              {a.label}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-slate-900/95 border-slate-700">
            <div className="text-sm text-slate-200">{a.desc}</div>
          </TooltipContent>
        </Tooltip>
        <span className={`font-semibold text-base ${a.color}`}>{value}</span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        className={`h-6 w-6 p-0 border border-slate-600/50 shrink-0 bg-slate-700/50 hover:bg-slate-600/60 transition-all duration-200 ${
          upPoints > 0
            ? "fa-upbtn fa-upbtn-glow ring-1 ring-teal-400/40 hover:ring-teal-400/60"
            : ""
        }`}
        aria-label={`Aumentar ${a.key}`}
        disabled={upPoints <= 0}
        onClick={() => onAddPoint(a.key)}
      >
        <icons.Plus className="size-3 text-slate-200" />
      </Button>
    </div>
  );
}
