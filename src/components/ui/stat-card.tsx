"use client";

import { cn } from "@/lib/utils";
import { Card } from "./card";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  up?: boolean;
  sub?: string;
  accent: string;
}

export function StatCard({ icon: Icon, label, value, change, up, sub, accent }: StatCardProps) {
  return (
    <Card className="p-3 lg:p-5 hover:scale-[1.02] transition-transform duration-300 animate-slide-up active:scale-[0.98]">
      <div className="flex items-start justify-between mb-2 lg:mb-3">
        <div className={cn("p-2 lg:p-2.5 rounded-xl", accent)}>
          <Icon size={18} className="text-white lg:w-5 lg:h-5" />
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-0.5 text-[10px] lg:text-xs font-semibold px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg",
            up ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"
          )}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>
      <p className="text-lg lg:text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs lg:text-sm text-slate-500 mt-0.5 lg:mt-1">{label}</p>
      {sub && <p className="text-[10px] lg:text-xs text-slate-400 mt-0.5 hidden sm:block">{sub}</p>}
    </Card>
  );
}
