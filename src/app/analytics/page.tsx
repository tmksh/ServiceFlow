"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CASES, monthlyRevenue, weekData, adROIData } from "@/lib/mock-data";
import { STAFF } from "@/lib/constants";
import { cn, fmt } from "@/lib/utils";
import { Download, TrendingUp, TrendingDown, Users, BarChart3, Target, Star } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const CAT_COLORS: Record<string, string> = {
  "不用品回収": "#6366f1",
  "引っ越し":   "#10b981",
  "ハウスクリーニング": "#f59e0b",
  "遺品整理":   "#8b5cf6",
  "その他":     "#94a3b8",
};

export default function AnalyticsPage() {
  const [staffFilter, setStaffFilter] = useState("all");
  const [period, setPeriod] = useState("month"); // month | quarter | year

  const staffPerf = useMemo(() =>
    STAFF.map((s) => {
      const sCases = CASES.filter((c) => c.staff === s && c.status === "completed");
      const rev = sCases.reduce((sum, c) => sum + c.amount, 0);
      const adCost = (Math.abs(s.charCodeAt(0) * 1234 + 5678) % 16 + 5) * 10000;
      return {
        name: s,
        cases: sCases.length,
        rev,
        adCost,
        roas: adCost > 0 ? Math.round((rev / adCost) * 100) : 0,
        avg: sCases.length > 0 ? Math.round(rev / sCases.length) : 0,
      };
    }),
    []
  );

  const filteredStaff = staffFilter === "all" ? staffPerf : staffPerf.filter((s) => s.name === staffFilter);

  const catData = useMemo(() => {
    const map: Record<string, number> = {};
    CASES.filter((c) => c.status === "completed").forEach((c) => {
      const label = c.category.label;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, []);

  const totalRev = staffPerf.reduce((s, p) => s + p.rev, 0);
  const totalCases = staffPerf.reduce((s, p) => s + p.cases, 0);
  const totalAdCost = staffPerf.reduce((s, p) => s + p.adCost, 0);
  const avgRoas = totalAdCost > 0 ? Math.round((totalRev / totalAdCost) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">売上分析</h1>
          <p className="text-xs text-slate-400 mt-1">Googleスプレッドシートの集計を自動化</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {([["month","月次"],["quarter","四半期"],["year","年次"]] as [string,string][]).map(([k,l]) => (
              <button key={k} onClick={() => setPeriod(k)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all", period === k ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                {l}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Download size={15} /> エクスポート
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "売上合計",   v: fmt(totalRev),      change: "+12.4%", up: true,  icon: TrendingUp,   color: "text-indigo-600",  bg: "from-indigo-500 to-indigo-600"  },
          { l: "完了案件数", v: `${totalCases}件`,  change: "+8.1%",  up: true,  icon: BarChart3,    color: "text-emerald-600", bg: "from-emerald-500 to-teal-500"   },
          { l: "広告費合計", v: fmt(totalAdCost),   change: "-3.2%",  up: false, icon: Target,       color: "text-amber-600",   bg: "from-amber-400 to-orange-500"   },
          { l: "平均ROAS",   v: `${avgRoas}%`,      change: "+15.8%", up: true,  icon: Star,         color: "text-violet-600",  bg: "from-violet-500 to-purple-600"  },
        ].map((k) => (
          <div key={k.l} className="relative overflow-hidden rounded-2xl liquid-glass liquid-glass-shimmer p-4 lg:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shadow-sm", k.bg)}>
                <k.icon size={18} className="text-white" />
              </div>
              <div className={cn("flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg liquid-glass-badge", k.up ? "text-emerald-700" : "text-red-600")}>
                {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {k.change}
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-black text-slate-900">{k.v}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.l}</p>
          </div>
        ))}
      </div>

      {/* グラフ 2列 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4">月次売上推移</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
              <Tooltip formatter={(v: number | undefined) => [v != null ? fmt(v) : "", "売上"]} labelStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="売上" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4">曜日別案件数</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip />
              <Bar dataKey="案件数" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* カテゴリ分布 + KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1">
          <h3 className="font-bold text-slate-800 mb-4">サービス別案件分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {catData.map((entry, i) => <Cell key={i} fill={CAT_COLORS[entry.name] || "#94a3b8"} />)}
              </Pie>
              <Tooltip formatter={(v: number | undefined, n: string | undefined) => [v != null ? `${v}件` : "", n ?? ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {catData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CAT_COLORS[d.name] }} /><span className="text-slate-600">{d.name}</span></div>
                <span className="font-semibold text-slate-800">{d.value}件</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h3 className="font-bold text-slate-800">担当者別パフォーマンス（ROAS）</h3>
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setStaffFilter("all")}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold transition-all", staffFilter === "all" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>
                全員
              </button>
              {STAFF.map((s) => (
                <button key={s} onClick={() => setStaffFilter(s)}
                  className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold transition-all", staffFilter === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {["担当者","完了件数","売上","広告費","ROAS","平均単価"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr key={s.name} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">{s.name[0]}</div>
                        <span className="text-sm font-medium text-slate-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.cases}件</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{fmt(s.rev)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{fmt(s.adCost)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold", s.roas >= 300 ? "text-emerald-600" : s.roas >= 200 ? "text-amber-600" : "text-red-500")}>{s.roas}%</span>
                        {s.roas >= 300 && <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">Good</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{fmt(s.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* モバイル */}
          <div className="lg:hidden divide-y divide-slate-100 mt-2">
            {filteredStaff.map((s) => (
              <div key={s.name} className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">{s.name[0]}</div>
                    <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                  </div>
                  <span className={cn("text-sm font-bold", s.roas >= 300 ? "text-emerald-600" : s.roas >= 200 ? "text-amber-600" : "text-red-500")}>ROAS {s.roas}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[["完了案件", `${s.cases}件`], ["売上", fmt(s.rev)], ["平均単価", fmt(s.avg)]].map(([l, v]) => (
                    <div key={l} className="bg-slate-50 rounded-lg py-2"><p className="text-[10px] text-slate-400">{l}</p><p className="text-xs font-bold text-slate-700 mt-0.5">{v}</p></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 広告媒体別ROI */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">広告媒体別ROI</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["媒体名","コスト","案件数","売上","ROI","CVR"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adROIData.map((a) => {
                const roi = a.cost > 0 ? Math.round(((a.rev - a.cost) / a.cost) * 100) : 0;
                return (
                  <tr key={a.name} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">{a.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{fmt(a.cost)}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{a.cases}件</td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-800">{fmt(a.rev)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold", roi > 100 ? "text-emerald-600" : "text-amber-600")}>{roi}%</span>
                        <div className="flex-1 max-w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", roi > 100 ? "bg-emerald-400" : "bg-amber-400")} style={{ width: `${Math.min(roi / 4, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{a.cvr}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* モバイル */}
        <div className="divide-y divide-slate-100">
          {adROIData.map((a) => {
            const roi = a.cost > 0 ? Math.round(((a.rev - a.cost) / a.cost) * 100) : 0;
            return (
              <div key={a.name} className="px-4 py-3.5 flex items-center justify-between">
                <div><p className="text-sm font-semibold text-slate-800">{a.name}</p><p className="text-xs text-slate-400 mt-0.5">{a.cases}件 · CVR {a.cvr}%</p></div>
                <div className="text-right"><span className={cn("text-base font-bold", roi > 100 ? "text-emerald-600" : "text-amber-600")}>ROI {roi}%</span><p className="text-xs text-slate-400 mt-0.5">{fmt(a.rev)}</p></div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
