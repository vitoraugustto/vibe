"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function usePrev<T>(v: T) {
  const r = useRef<T>(v);
  useEffect(() => {
    r.current = v;
  }, [v]);
  return r.current;
}

export function HpBar({
  current,
  max,
  className,
  height = 8,
}: {
  current: number;
  max: number;
  className?: string;
  height?: number;
}) {
  const targetPct = Math.round(clamp01(current / Math.max(1, max)) * 100);
  const [mainPct, setMainPct] = useState(targetPct);
  const [ghostPct, setGhostPct] = useState(targetPct);
  const mainPctRef = useRef(mainPct);
  const ghostPctRef = useRef(ghostPct);
  const [flash, setFlash] = useState<"damage" | "heal" | null>(null);
  const mainRaf = useRef<number | null>(null);
  const ghostRaf = useRef<number | null>(null);
  const ghostDelayTo = useRef<number | null>(null);

  useEffect(() => {
    mainPctRef.current = mainPct;
  }, [mainPct]);
  useEffect(() => {
    ghostPctRef.current = ghostPct;
  }, [ghostPct]);

  function animateTo(
    ref: React.MutableRefObject<number>,
    set: (n: number) => void,
    rafRef: React.MutableRefObject<number | null>,
    target: number,
    speed: number
  ) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = () => {
      const cur = ref.current;
      const d = target - cur;
      const next = cur + d * speed;
      const done = Math.abs(d) < 0.2;
      const finalVal = done ? target : next;
      ref.current = finalVal;
      set(finalVal);
      if (!done) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }

  useEffect(() => {
    const prev = mainPctRef.current;
    if (targetPct < prev) {
      // Damage: main falls fast, ghost lags then follows slowly
      setFlash("damage");
      const t1 = setTimeout(() => setFlash(null), 280);
      animateTo(mainPctRef, setMainPct, mainRaf, targetPct, 0.35);
      if (ghostDelayTo.current) clearTimeout(ghostDelayTo.current);
      ghostDelayTo.current = window.setTimeout(() => {
        animateTo(ghostPctRef, setGhostPct, ghostRaf, targetPct, 0.08);
      }, 120);
      return () => clearTimeout(t1);
    } else if (targetPct > prev) {
      // Heal: jump ghost to target, raise main smoothly
      setFlash("heal");
      const t1 = setTimeout(() => setFlash(null), 320);
      setGhostPct(targetPct);
      ghostPctRef.current = targetPct;
      animateTo(mainPctRef, setMainPct, mainRaf, targetPct, 0.25);
      return () => clearTimeout(t1);
    }
  }, [targetPct]);

  useEffect(
    () => () => {
      if (mainRaf.current) cancelAnimationFrame(mainRaf.current);
      if (ghostRaf.current) cancelAnimationFrame(ghostRaf.current);
      if (ghostDelayTo.current) clearTimeout(ghostDelayTo.current);
    },
    []
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-slate-800/60 border border-slate-700/50",
        className
      )}
      style={{ height }}
    >
      {/* Ghost (damage) layer */}
      <div
        className="absolute inset-y-0 left-0 bg-red-500/40 transition-all duration-200"
        style={{ width: `${ghostPct}%` }}
        aria-hidden
      />

      {/* Main HP layer */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-green-500 transition-all duration-200"
        style={{ width: `${mainPct}%` }}
      />

      {/* Flash overlays */}
      {flash === "damage" && (
        <div
          className="absolute inset-0 fa-hp-damage bg-red-400/30"
          aria-hidden
        />
      )}
      {flash === "heal" && (
        <div
          className="absolute inset-0 fa-hp-heal bg-green-400/30"
          aria-hidden
        />
      )}
    </div>
  );
}

export function XpBar({
  value,
  level,
  className,
  height = 8,
}: {
  value: number; // 0..1
  level: number;
  className?: string;
  height?: number;
}) {
  const targetPct = Math.round(clamp01(value) * 100);
  const [pct, setPct] = useState(targetPct);
  const pctRef = useRef(pct);
  const rafRef = useRef<number | null>(null);
  const prevTargetRef = useRef(targetPct);
  const prevLevel = usePrev(level);
  const [shimmer, setShimmer] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    pctRef.current = pct;
  }, [pct]);

  function animate(target: number, speed = 0.2) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = () => {
      const cur = pctRef.current;
      const d = target - cur;
      const next = cur + d * speed;
      const done = Math.abs(d) < 0.2;
      const finalVal = done ? target : next;
      pctRef.current = finalVal;
      setPct(finalVal);
      if (!done) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }

  // Shimmer on gain; animate to target
  useEffect(() => {
    if (targetPct > prevTargetRef.current) {
      setShimmer(true);
      const t = setTimeout(() => setShimmer(false), 650);
      animate(targetPct, 0.22);
      prevTargetRef.current = targetPct;
      return () => clearTimeout(t);
    }
    // Level-up wrap (target may be lower but level increased)
    if (level > prevLevel) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 700);
      animate(targetPct, 0.25);
      prevTargetRef.current = targetPct;
      return () => clearTimeout(t);
    }
    // No change or decrease without level up
    animate(targetPct, 0.18);
    prevTargetRef.current = targetPct;
  }, [targetPct, level, prevLevel]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-slate-800/60 border border-slate-700/50",
        pulse && "fa-xp-lvlup ring-1 ring-purple-400/30",
        className
      )}
      style={{ height }}
    >
      {/* Main XP bar */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />

      {/* Shimmer effect */}
      <div
        className={cn("fa-xp-shimmer absolute inset-0", shimmer && "is-on")}
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12"
          style={{
            animation: shimmer ? "shimmer 0.6s ease-out" : "none",
          }}
        />
      </div>

      {/* Level up effect */}
      {pulse && (
        <div className="absolute inset-0 bg-purple-400/20" aria-hidden />
      )}
    </div>
  );
}
