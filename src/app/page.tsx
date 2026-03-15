"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CASES, monthlyRevenue, categoryDonut, hourData } from "@/lib/mock-data";
import { STATUS_MAP } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Case } from "@/types";
import {
  Zap, MapPin, Clock,
  ChevronRight, Download, ChevronDown,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { QuickCaseModal } from "@/components/ui/quick-case-modal";

type PeriodKey = "today" | "week" | "month" | "lastMonth";

const PERIODS: { id: PeriodKey; label: string; short: string }[] = [
  { id: "today",     label: "今日",   short: "今日" },
  { id: "week",      label: "今週",   short: "今週" },
  { id: "month",     label: "今月",   short: "今月" },
  { id: "lastMonth", label: "先月",   short: "先月" },
];

const NOW = new Date(2026, 1, 13); // モックの"今日"

function getPeriodFilter(period: PeriodKey): (dateStr: string) => boolean {
  const y = NOW.getFullYear(), m = NOW.getMonth(), d = NOW.getDate();
  if (period === "today") {
    const today = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return (ds) => ds === today;
  }
  if (period === "week") {
    const dow = (NOW.getDay() + 6) % 7; // 月曜=0
    const weekStart = new Date(y, m, d - dow);
    const weekEnd = new Date(y, m, d);
    return (ds) => {
      const dt = new Date(ds);
      return dt >= weekStart && dt <= weekEnd;
    };
  }
  if (period === "month") {
    const prefix = `${y}-${String(m + 1).padStart(2, "0")}`;
    return (ds) => ds.startsWith(prefix);
  }
  // lastMonth
  const lm = m === 0 ? 11 : m - 1;
  const ly = m === 0 ? y - 1 : y;
  const prefix = `${ly}-${String(lm + 1).padStart(2, "0")}`;
  return (ds) => ds.startsWith(prefix);
}

function getPeriodLabel(period: PeriodKey): string {
  const y = NOW.getFullYear(), m = NOW.getMonth(), d = NOW.getDate();
  if (period === "today") return `${m + 1}月${d}日（${["日","月","火","水","木","金","土"][NOW.getDay()]}）の概況`;
  if (period === "week") {
    const dow = (NOW.getDay() + 6) % 7;
    const ws = new Date(y, m, d - dow);
    return `${ws.getMonth() + 1}/${ws.getDate()} 〜 ${m + 1}/${d} の概況`;
  }
  if (period === "month") return `${y}年${m + 1}月の概況`;
  const lm = m === 0 ? 11 : m - 1;
  const ly = m === 0 ? y - 1 : y;
  return `${ly}年${lm + 1}月の概況`;
}

export default function DashboardPage() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

  const stats = useMemo(() => {
    const filter = getPeriodFilter(period);
    const inPeriod = CASES.filter((c) => filter(c.date));
    const completed = inPeriod.filter((c) => c.status === "completed");
    const cancelled = inPeriod.filter((c) => c.status === "cancelled");
    const revenue = completed.reduce((s, c) => s + c.amount, 0);
    const cancelRate = inPeriod.length
      ? ((cancelled.length / inPeriod.length) * 100).toFixed(1)
      : "0.0";
    const avg = completed.length
      ? Math.floor(completed.reduce((s, c) => s + c.amount, 0) / completed.length)
      : 0;
    return { revenue, count: inPeriod.length, cancelRate, avg, completed: completed.length };
  }, [period]);

  const urgent = CASES.filter(
    (c) => c.urgent && c.status !== "completed" && c.status !== "cancelled"
  ).slice(0, 4);

  const recent = CASES.slice(0, 7);

  const periodLabel = getPeriodLabel(period);

  return (
    <>
      <PullToRefresh onRefresh={() => {}}>
      <div className="space-y-4 lg:space-y-6 animate-fade-in">
        {/* Header - hidden on mobile (shown in header bar) */}
        <div className="hidden lg:flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ホーム</h1>
            <p className="text-sm text-slate-500 mt-0.5">{periodLabel}</p>
          </div>
          <div className="flex items-center gap-2 self-start">
            {/* 期間セレクター（PC） */}
            <div className="relative">
              <button
                onClick={() => setPeriodMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                {PERIODS.find((p) => p.id === period)?.label}
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {periodMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPeriodMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-28 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                    {PERIODS.map((p) => (
                      <button key={p.id} onClick={() => { setPeriod(p.id); setPeriodMenuOpen(false); }}
                        className={cn("w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50",
                          period === p.id ? "font-semibold text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                        )}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">
              <Download size={16} /> レポート出力
            </button>
          </div>
        </div>

        {/* Mobile: 期間セレクター + サブタイトル */}
        <div className="flex items-center justify-between lg:hidden">
          <p className="text-xs text-slate-400">{periodLabel}</p>
          <div className="relative">
            <button
              onClick={() => setPeriodMenuOpen((v) => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 active:bg-slate-50 shadow-sm"
            >
              {PERIODS.find((p) => p.id === period)?.short}
              <ChevronDown size={12} className="text-slate-400" />
            </button>
            {periodMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPeriodMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                  {PERIODS.map((p) => (
                    <button key={p.id} onClick={() => { setPeriod(p.id); setPeriodMenuOpen(false); }}
                      className={cn("w-full text-left px-3 py-2.5 text-sm transition-colors active:bg-slate-50",
                        period === p.id ? "font-semibold text-indigo-600 bg-indigo-50/50" : "text-slate-700"
                      )}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            label={`${PERIODS.find((p) => p.id === period)?.short}の売上`}
            value={fmt(stats.revenue)}
            change="+12.5%"
            up
            sub="目標達成率 78%"
            gradientFrom="#6366f1"
            gradientTo="#818cf8"
          />
          <StatCard
            label={`${PERIODS.find((p) => p.id === period)?.short}の案件数`}
            value={stats.count.toLocaleString()}
            change="+8件"
            up
            sub={`完了: ${stats.completed}件`}
            gradientFrom="#8b5cf6"
            gradientTo="#a78bfa"
          />
          <StatCard
            label="キャンセル率"
            value={`${stats.cancelRate}%`}
            change="-2.3%"
            up
            sub="前月比改善"
            gradientFrom="#06b6d4"
            gradientTo="#67e8f9"
          />
          <StatCard
            label="平均案件単価"
            value={fmt(stats.avg)}
            change="+¥3,200"
            up
            sub="前月比"
            gradientFrom="#10b981"
            gradientTo="#34d399"
          />
        </div>

        {/* Urgent Cases */}
        {urgent.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl liquid-glass liquid-glass-shimmer border border-amber-200/60"
            style={{ background: "linear-gradient(135deg, rgba(255,251,235,0.85) 0%, rgba(255,237,213,0.75) 100%)" }}>
            <div className="p-3 lg:p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-500 rounded-xl shadow-sm shadow-amber-200">
                  <Zap size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-sm lg:text-base">緊急・当日案件</h3>
                  <p className="text-xs text-amber-600">{urgent.length}件の対応待ち</p>
                </div>
              </div>
              <div className="space-y-2">
                {urgent.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-xl px-3 lg:px-4 py-2.5 border border-amber-100/80">
                    <div className="flex items-center gap-2 lg:gap-3 flex-wrap min-w-0">
                      <span className="text-xs font-mono text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{c.id}</span>
                      <span className="text-sm font-medium text-slate-800 truncate">{c.customer}</span>
                      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hidden sm:inline-flex">
                        {c.category.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3 text-sm shrink-0">
                      <span className="text-slate-500 hidden sm:flex items-center gap-1">
                        <MapPin size={14} />{c.pref}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1 text-xs">
                        <Clock size={12} />{c.time}
                      </span>
                      <button
                        onClick={() => setSelectedCase(c)}
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-lg active:bg-amber-600 font-medium transition-colors shadow-sm">
                        対応
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend */}
          <Card className="lg:col-span-2 p-4 lg:p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm lg:text-base">売上推移（月次）</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                <Tooltip formatter={(value) => [fmt(value as number), "売上"]} labelStyle={{ color: "#334155" }} />
                <Area type="monotone" dataKey="売上" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Donut */}
          <Card className="p-4 lg:p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm lg:text-base">カテゴリ別案件</h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={categoryDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryDonut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {categoryDonut.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-600 text-xs lg:text-sm">{d.name}</span>
                  </div>
                  <span className="font-medium text-slate-800 text-xs lg:text-sm">{d.value}件</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Cases */}
          <Card className="p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="font-bold text-slate-800 text-sm lg:text-base">直近の案件</h3>
              <Link href="/cases" className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700 active:text-indigo-800 transition-colors">
                すべて <ChevronRight size={16} />
              </Link>
            </div>
            <div className="space-y-0.5">
              {recent.map((c) => (
                <div key={c.id} onClick={() => setSelectedCase(c)} className="flex items-center justify-between py-2.5 px-2 lg:px-3 rounded-xl active:bg-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: c.category.color }}
                    >
                      {c.category.label[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 truncate">{c.customer}</span>
                        {c.urgent && <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse-dot shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400">{c.date.slice(5)} {c.time}</p>
                    </div>
                  </div>
                  <Badge className={STATUS_MAP[c.status].className}>
                    {STATUS_MAP[c.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Hourly Distribution */}
          <Card className="p-4 lg:p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm lg:text-base">時間帯別の案件分布</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="案件数" fill="#6366f1" radius={[6, 6, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </PullToRefresh>

    {selectedCase && (
      <QuickCaseModal c={selectedCase} onClose={() => setSelectedCase(null)} />
    )}
    </>
  );
}
