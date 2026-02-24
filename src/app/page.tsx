"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CASES, monthlyRevenue, categoryDonut, hourData } from "@/lib/mock-data";
import { STATUS_MAP } from "@/lib/constants";
import { fmt } from "@/lib/utils";
import {
  DollarSign, FileText, Percent, Target, Zap, MapPin, Clock,
  ChevronRight, Download, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

export default function DashboardPage() {
  const stats = useMemo(() => {
    const thisMonth = CASES.filter((c) => c.date.startsWith("2026-02"));
    const completed = CASES.filter((c) => c.status === "completed");
    const revenue = thisMonth
      .filter((c) => c.status === "completed")
      .reduce((s, c) => s + c.amount, 0);
    const cancelRate = ((CASES.filter((c) => c.status === "cancelled").length / CASES.length) * 100).toFixed(1);
    const avg = completed.length
      ? Math.floor(completed.reduce((s, c) => s + c.amount, 0) / completed.length)
      : 0;
    return { revenue, count: thisMonth.length, cancelRate, avg, completed: completed.length };
  }, []);

  const urgent = CASES.filter(
    (c) => c.urgent && c.status !== "completed" && c.status !== "cancelled"
  ).slice(0, 4);

  const recent = CASES.slice(0, 7);

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="space-y-4 lg:space-y-6 animate-fade-in">
        {/* Header - hidden on mobile (shown in header bar) */}
        <div className="hidden lg:flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>
            <p className="text-sm text-slate-500 mt-0.5">2026年2月13日（木）の概況</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 self-start transition-colors">
            <Download size={16} /> レポート出力
          </button>
        </div>

        {/* Mobile: date subtitle */}
        <p className="text-xs text-slate-400 lg:hidden">2026年2月13日（木）の概況</p>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            icon={DollarSign}
            label="今月の売上"
            value={fmt(stats.revenue)}
            change="+12.5%"
            up
            sub="目標達成率 78%"
            accent="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <StatCard
            icon={FileText}
            label="今月の案件数"
            value={stats.count.toLocaleString()}
            change="+8件"
            up
            sub={`完了: ${stats.completed}件`}
            accent="bg-gradient-to-br from-violet-500 to-violet-600"
          />
          <StatCard
            icon={Percent}
            label="キャンセル率"
            value={`${stats.cancelRate}%`}
            change="-2.3%"
            up
            sub="前月比改善"
            accent="bg-gradient-to-br from-cyan-500 to-cyan-600"
          />
          <StatCard
            icon={Target}
            label="平均案件単価"
            value={fmt(stats.avg)}
            change="+¥3,200"
            up
            sub="前月比"
            accent="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
        </div>

        {/* Urgent Cases */}
        {urgent.length > 0 && (
          <Card className="p-3 lg:p-4 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-500 rounded-xl">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm lg:text-base">緊急・当日案件</h3>
                <p className="text-xs text-amber-600">{urgent.length}件の対応待ち</p>
              </div>
            </div>
            <div className="space-y-2">
              {urgent.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-white/80 rounded-xl px-3 lg:px-4 py-2.5 border border-amber-100">
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
                    <button className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-lg active:bg-amber-600 font-medium transition-colors">
                      対応
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
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
                <div key={c.id} className="flex items-center justify-between py-2.5 px-2 lg:px-3 rounded-xl active:bg-slate-50 hover:bg-slate-50 transition-colors">
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
  );
}
