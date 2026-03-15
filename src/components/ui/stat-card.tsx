"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  up?: boolean;
  sub?: string;
  /** Tailwind クラス（legacy用、未使用） */
  accent?: string;
  gradientFrom?: string;
  gradientTo?: string;
  icon?: LucideIcon;
}

export function StatCard({
  label,
  value,
  change,
  up,
  sub,
  gradientFrom = "#6366f1",
  gradientTo,
  icon: Icon,
}: StatCardProps) {
  const from = gradientFrom;
  const to = gradientTo ?? gradientFrom;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-3 lg:p-5",
        "hover:scale-[1.02] transition-transform duration-300 animate-slide-up active:scale-[0.98]",
        "liquid-glass liquid-glass-shimmer"
      )}
    >
      {/* カラーグロー（左上） */}
      <div
        className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${from}, ${to})` }}
      />
      {/* カラーグロー（右下） */}
      <div
        className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-15 blur-xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${to}, ${from})` }}
      />

      {/* アイコン */}
      {Icon && (
        <div
          className="relative z-10 w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center mb-2 liquid-glass-icon"
          style={{ color: from }}
        >
          <Icon size={16} />
        </div>
      )}

      {/* 変化率バッジ */}
      {change && (
        <div className="relative z-10 flex justify-end mb-1 lg:mb-2">
          <div
            className={cn(
              "liquid-glass-badge flex items-center gap-0.5 text-[10px] lg:text-xs font-semibold px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg",
              up ? "text-emerald-700" : "text-red-600"
            )}
          >
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </div>
        </div>
      )}

      <p
        className="relative z-10 text-xl lg:text-2xl font-bold tracking-tight"
        style={{ color: from }}
      >
        {value}
      </p>
      <p className="relative z-10 text-xs lg:text-sm text-slate-600 mt-0.5 lg:mt-1 font-medium">{label}</p>
      {sub && (
        <p className="relative z-10 text-[10px] lg:text-xs text-slate-400 mt-0.5 hidden sm:block">{sub}</p>
      )}
    </div>
  );
}
