"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calculator, BarChart3, Target } from "lucide-react";
import SettlementPage from "../settlement/page";
import AnalyticsPage from "../analytics/page";
import AdsPage from "../ads/page";

const REPORT_TABS = [
  { id: "settlement", l: "日報・精算", Icon: Calculator },
  { id: "analytics", l: "売上分析", Icon: BarChart3 },
  { id: "adlp", l: "広告・LP管理", Icon: Target },
] as const;

export default function ReportsPage() {
  const [rtab, setRtab] = useState<string>("settlement");

  return (
    <div className="animate-fade-in">
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-6 border border-slate-200/60 shadow-sm w-fit">
        {REPORT_TABS.map((t) => (
          <button key={t.id} onClick={() => setRtab(t.id)} className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            rtab === t.id ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}>
            <t.Icon size={16} /> {t.l}
          </button>
        ))}
      </div>
      {rtab === "settlement" && <SettlementPage />}
      {rtab === "analytics" && <AnalyticsPage />}
      {rtab === "adlp" && <AdsPage />}
    </div>
  );
}
