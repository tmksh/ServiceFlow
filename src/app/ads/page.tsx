"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { LPS, PLATFORMS } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/utils";
import type { LP } from "@/types";
import {
  Plus, Globe, TrendingUp, Target, Users, X,
  Play, Pause,
} from "lucide-react";

export default function AdsPage() {
  const [tab, setTab] = useState<"lps" | "platforms" | "trend">("lps");
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<LP | null>(null);

  const activeLPs = LPS.filter((l) => l.status === "active");
  const totalCost = LPS.reduce((s, l) => s + l.cost, 0);
  const totalRev = LPS.reduce((s, l) => s + l.revenue, 0);
  const totalCases = LPS.reduce((s, l) => s + l.cases, 0);
  const overallROAS = totalCost > 0 ? ((totalRev / totalCost) * 100).toFixed(0) : "0";
  const overallCPA = totalCases > 0 ? Math.round(totalCost / totalCases) : 0;

  const platStats = useMemo(() => PLATFORMS.map((p) => {
    const pLPs = LPS.filter((l) => l.platform === p.id);
    const cost = pLPs.reduce((s, l) => s + l.cost, 0);
    const rev = pLPs.reduce((s, l) => s + l.revenue, 0);
    const cs = pLPs.reduce((s, l) => s + l.cases, 0);
    const clk = pLPs.reduce((s, l) => s + l.clicks, 0);
    const imp = pLPs.reduce((s, l) => s + l.impressions, 0);
    return { ...p, lpCount: pLPs.length, cost, rev, cases: cs, clicks: clk, impressions: imp,
      roas: cost > 0 ? ((rev / cost) * 100).toFixed(0) : "0",
      cpa: cs > 0 ? Math.round(cost / cs) : 0,
      cvr: clk > 0 ? ((cs / clk) * 100).toFixed(1) : "0",
      ctr: imp > 0 ? ((clk / imp) * 100).toFixed(2) : "0",
    };
  }).filter((p) => p.lpCount > 0), []);

  const filtered = filter === "all" ? LPS : LPS.filter((l) => l.platform === filter);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">広告・LP管理</h1>
          <p className="text-xs text-slate-400 mt-1">LP別の売上・広告パフォーマンスを一元分析</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200">
          <Plus size={16} /> LP新規登録
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Globe} label="登録LP数" value={`${LPS.length}件`} sub={`稼働中 ${activeLPs.length}件`} accent="bg-gradient-to-br from-indigo-500 to-indigo-600" />
        <StatCard icon={Target} label="広告費合計" value={fmt(totalCost)} accent="bg-gradient-to-br from-violet-500 to-violet-600" />
        <StatCard icon={TrendingUp} label="LP経由売上" value={fmt(totalRev)} accent="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard icon={Target} label="全体ROAS" value={`${overallROAS}%`} sub="目標: 800%" accent="bg-gradient-to-br from-cyan-500 to-cyan-600" />
        <StatCard icon={Users} label="平均CPA" value={fmt(overallCPA)} sub={`${totalCases}件獲得`} accent="bg-gradient-to-br from-amber-500 to-amber-600" />
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {([["lps", "LP一覧"], ["platforms", "プラットフォーム比較"], ["trend", "推移分析"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)} className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tab === k ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}>{l}</button>
        ))}
      </div>

      {/* LP一覧タブ */}
      {tab === "lps" && (
        <>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter("all")} className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              filter === "all" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            )}>すべて ({LPS.length})</button>
            {PLATFORMS.map((p) => {
              const cnt = LPS.filter((l) => l.platform === p.id).length;
              if (cnt === 0) return null;
              return (
                <button key={p.id} onClick={() => setFilter(p.id)} className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  filter === p.id ? p.accent : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                )}>
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: p.color }} />{p.name} ({cnt})
                </button>
              );
            })}
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-slate-100">
                  {["LP名", "プラットフォーム", "エリア", "広告費", "クリック数", "案件数", "売上", "CPA", "ROAS", "CVR", "状態"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.map((lp) => {
                    const plat = PLATFORMS.find((p) => p.id === lp.platform);
                    const cpa = lp.cases > 0 ? Math.round(lp.cost / lp.cases) : 0;
                    const roas = lp.cost > 0 ? ((lp.revenue / lp.cost) * 100).toFixed(0) : "0";
                    const cvr = lp.clicks > 0 ? ((lp.cases / lp.clicks) * 100).toFixed(1) : "0";
                    return (
                      <tr key={lp.id} className={cn("border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer", lp.status === "paused" && "opacity-60")} onClick={() => setDetail(lp)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${plat?.color}15` }}>
                              <Globe size={16} style={{ color: plat?.color || "#6366f1" }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 max-w-[200px] truncate">{lp.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{lp.url}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("border", plat?.accent)}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: plat?.color }} />{plat?.name}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{lp.area}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{fmt(lp.cost)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{lp.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{lp.cases}件</td>
                        <td className="px-4 py-3 text-sm font-bold text-indigo-600">{fmt(lp.revenue)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{fmt(cpa)}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-sm font-bold", Number(roas) >= 500 ? "text-emerald-600" : Number(roas) >= 300 ? "text-amber-600" : "text-red-500")}>{roas}%</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{cvr}%</td>
                        <td className="px-4 py-3">
                          {lp.status === "active"
                            ? <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200"><Play size={10} />稼働中</Badge>
                            : <Badge className="bg-slate-100 text-slate-500 border border-slate-200"><Pause size={10} />停止中</Badge>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* プラットフォーム比較タブ */}
      {tab === "platforms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">プラットフォーム別パフォーマンス</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-100">
                    {["プラットフォーム", "種別", "LP数", "広告費", "売上", "案件数", "ROAS", "CPA", "CVR"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {platStats.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                            <span className="text-sm font-medium text-slate-800">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5"><Badge className={cn("border", p.accent)}>{p.type}</Badge></td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{p.lpCount}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{fmt(p.cost)}</td>
                        <td className="px-4 py-3.5 text-sm font-bold text-slate-800">{fmt(p.rev)}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{p.cases}件</td>
                        <td className="px-4 py-3.5"><span className={cn("text-sm font-bold", Number(p.roas) >= 500 ? "text-emerald-600" : "text-amber-600")}>{p.roas}%</span></td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{fmt(p.cpa)}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{p.cvr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[{ t: "リスティング", ty: "リスティング" as const, cl: "from-blue-500 to-blue-600" }, { t: "SNS広告", ty: "SNS" as const, cl: "from-pink-500 to-pink-600" }].map((grp) => {
                const gps = platStats.filter((p) => p.type === grp.ty);
                const gRev = gps.reduce((s, p) => s + p.rev, 0);
                const gCost = gps.reduce((s, p) => s + p.cost, 0);
                const gCases = gps.reduce((s, p) => s + p.cases, 0);
                return (
                  <Card key={grp.t} className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", grp.cl)}><Target size={18} className="text-white" /></div>
                      <div>
                        <h4 className="font-bold text-slate-800">{grp.t}</h4>
                        <p className="text-xs text-slate-400">{gps.length}プラットフォーム</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div><p className="text-lg font-bold text-slate-800">{fmt(gRev)}</p><p className="text-[10px] text-slate-400">売上</p></div>
                      <div><p className="text-lg font-bold text-slate-800">{gCases}件</p><p className="text-[10px] text-slate-400">案件数</p></div>
                      <div><p className="text-lg font-bold text-emerald-600">{gCost > 0 ? ((gRev / gCost) * 100).toFixed(0) : 0}%</p><p className="text-[10px] text-slate-400">ROAS</p></div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-bold text-slate-800 mb-4">プラットフォーム別売上構成</h3>
              <div className="space-y-3">
                {platStats.map((p) => {
                  const pct = totalRev > 0 ? Math.round((p.rev / totalRev) * 100) : 0;
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                          <span className="text-slate-600">{p.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800">{fmt(p.rev)} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: p.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500 rounded-xl"><TrendingUp size={18} className="text-white" /></div>
                <div>
                  <h4 className="font-bold text-blue-900">リスティング広告が主力</h4>
                  <p className="text-xs text-blue-600 mt-0.5">売上の{totalRev > 0 ? Math.round(platStats.filter((p) => p.type === "リスティング").reduce((s, p) => s + p.rev, 0) / totalRev * 100) : 0}%がリスティング経由です</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 推移分析タブ */}
      {tab === "trend" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">LP別 案件獲得数ランキング</h3>
            <div className="space-y-3">
              {[...LPS].sort((a, b) => b.cases - a.cases).slice(0, 6).map((lp, i) => {
                const maxC = LPS.reduce((m, l) => Math.max(m, l.cases), 0);
                const plat = PLATFORMS.find((p) => p.id === lp.platform);
                return (
                  <div key={lp.id} className="flex items-center gap-3">
                    <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold",
                      i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-200 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"
                    )}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{lp.name}</p>
                        <span className="text-sm font-bold text-indigo-600">{lp.cases}件</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(lp.cases / maxC) * 100}%`, background: plat?.color || "#6366f1" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">CPA比較（安い順）</h3>
            <div className="space-y-3">
              {[...LPS].filter((l) => l.cases > 0).map((l) => ({ ...l, cpa: Math.round(l.cost / l.cases) })).sort((a, b) => a.cpa - b.cpa).slice(0, 6).map((lp) => {
                const plat = PLATFORMS.find((p) => p.id === lp.platform);
                return (
                  <div key={lp.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: plat?.color }} />
                      <p className="text-sm text-slate-700 truncate max-w-[200px]">{lp.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-bold", lp.cpa < 5000 ? "text-emerald-600" : lp.cpa < 8000 ? "text-amber-600" : "text-red-500")}>{fmt(lp.cpa)}</p>
                      <p className="text-[10px] text-slate-400">{lp.cases}件獲得</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">ROAS比較（高い順）</h3>
            <div className="space-y-3">
              {[...LPS].filter((l) => l.cost > 0).map((l) => ({ ...l, roas: Math.round(l.revenue / l.cost * 100) })).sort((a, b) => b.roas - a.roas).slice(0, 6).map((lp) => {
                const plat = PLATFORMS.find((p) => p.id === lp.platform);
                return (
                  <div key={lp.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: plat?.color }} />
                      <p className="text-sm text-slate-700 truncate max-w-[200px]">{lp.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-bold", lp.roas >= 1000 ? "text-emerald-600" : lp.roas >= 500 ? "text-amber-600" : "text-red-500")}>{lp.roas}%</p>
                      <p className="text-[10px] text-slate-400">売上 {fmt(lp.revenue)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* LP Detail Modal */}
      {detail && (() => {
        const lp = detail;
        const plat = PLATFORMS.find((p) => p.id === lp.platform);
        const cpa = lp.cases > 0 ? Math.round(lp.cost / lp.cases) : 0;
        const roas = lp.cost > 0 ? ((lp.revenue / lp.cost) * 100).toFixed(0) : "0";
        const cvr = lp.clicks > 0 ? ((lp.cases / lp.clicks) * 100).toFixed(1) : "0";
        const ctr = lp.impressions > 0 ? ((lp.clicks / lp.impressions) * 100).toFixed(2) : "0";
        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${plat?.color}15` }}>
                    <Globe size={20} style={{ color: plat?.color || "#6366f1" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{lp.name}</h3>
                    <p className="text-xs text-slate-400">{lp.url}</p>
                  </div>
                </div>
                <button onClick={() => setDetail(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["プラットフォーム", plat?.name || "", plat?.color],
                    ["エリア", lp.area, "#6366f1"],
                    ["ステータス", lp.status === "active" ? "稼働中" : "停止中", lp.status === "active" ? "#10b981" : "#94a3b8"],
                  ].map(([l, v, c]) => (
                    <div key={l} className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] text-slate-400 mb-1">{l}</p>
                      <p className="text-sm font-semibold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: c }} />{v}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    ["広告費", fmt(lp.cost)], ["インプレッション", lp.impressions.toLocaleString()],
                    ["クリック", lp.clicks.toLocaleString()], ["CTR", `${ctr}%`],
                    ["案件数", `${lp.cases}件`], ["売上", fmt(lp.revenue)],
                    ["CPA", fmt(cpa)], ["ROAS", `${roas}%`],
                  ].map(([l, v]) => (
                    <div key={l} className="text-center py-3">
                      <p className="text-xs text-slate-400">{l}</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">CVRファネル</p>
                  <div className="space-y-2">
                    {[
                      ["インプレッション", lp.impressions, 1],
                      ["クリック", lp.clicks, lp.clicks / lp.impressions],
                      ["案件獲得", lp.cases, lp.cases / lp.impressions],
                    ].map(([l, v, r]) => (
                      <div key={l as string}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">{l as string}</span>
                          <span className="font-semibold text-slate-800">{(v as number).toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max((r as number) * 100, 2)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
