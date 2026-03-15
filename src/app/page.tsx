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
  ChevronRight, Download, TrendingUp,
  X, Phone, Activity, Check, User, Calendar, CreditCard,
  Package, Building2, FileText, MessageSquare, Image, Plus, Send,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ─── ミニ案件詳細モーダル（ダッシュボード用） ────────────────────────────────
function QuickCaseModal({ c, onClose }: { c: Case; onClose: () => void }) {
  const [status, setStatus] = useState(c.status);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex flex-col justify-end lg:justify-center lg:items-center p-0 lg:p-4" onClick={onClose}>
      <div
        className="relative w-full lg:w-[520px] bg-white lg:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] lg:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: c.category.color }}>
              {c.category.label[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900 truncate">{c.id} — {c.customer}</h2>
                <Badge className={STATUS_MAP[status].className}>{STATUS_MAP[status].label}</Badge>
                {c.urgent && <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs"><Zap size={9} />緊急</Badge>}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{c.category.label} · {c.date} {c.time}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 shrink-0 ml-2">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {([
              { icon: User,      l: "顧客名",       v: c.customer },
              { icon: Phone,     l: "電話番号",     v: c.phone },
              { icon: MapPin,    l: "住所",         v: c.addr },
              { icon: Calendar,  l: "日時",         v: `${c.date} ${c.time}` },
              { icon: Activity,  l: "金額",         v: c.amount > 0 ? fmt(c.amount) : "未確定" },
              { icon: User,      l: "担当",         v: c.staff },
            ] as { icon: React.ElementType; l: string; v: string }[]).map(({ icon: Icon, l, v }) => (
              <div key={l} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
                <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400">{l}</p>
                  <p className="text-sm font-medium text-slate-700 break-all">{v}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <button
                onClick={() => setStatusMenuOpen((v) => !v)}
                className={cn("w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2", STATUS_MAP[status].className)}
              >
                <Activity size={15} /> {STATUS_MAP[status].label} ▾
              </button>
              {statusMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setStatusMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                    {(Object.keys(STATUS_MAP) as Array<keyof typeof STATUS_MAP>).map((s) => (
                      <button key={s} onClick={() => { setStatus(s); setStatusMenuOpen(false); }}
                        className={cn("w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-slate-50", s === status ? "font-semibold" : "text-slate-600")}>
                        {STATUS_MAP[s].label}
                        {s === status && <Check size={13} className="ml-auto text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <a href={`tel:${c.phone}`}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Phone size={15} /> 電話
            </a>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.addr)}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin size={15} className="text-indigo-500" /> Google マップで確認
          </a>
          <Link href="/cases" onClick={onClose}
            className="w-full py-2.5 bg-slate-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
            <FileText size={15} /> 案件詳細ページへ <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

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
    <>
      <PullToRefresh onRefresh={() => {}}>
      <div className="space-y-4 lg:space-y-6 animate-fade-in">
        {/* Header - hidden on mobile (shown in header bar) */}
        <div className="hidden lg:flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ホーム</h1>
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
            label="今月の売上"
            value={fmt(stats.revenue)}
            change="+12.5%"
            up
            sub="目標達成率 78%"
            gradientFrom="#6366f1"
            gradientTo="#818cf8"
          />
          <StatCard
            label="今月の案件数"
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
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-lg active:bg-amber-600 font-medium transition-colors">
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
