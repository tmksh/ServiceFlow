"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CASES } from "@/lib/mock-data";
import { STATUS_MAP, CATEGORIES } from "@/lib/constants";
import { cn, fmt } from "@/lib/utils";
import type { Case, CaseStatus } from "@/types";
import {
  Plus, FileText, Users, Phone, MapPin, Zap, Calendar,
  X, User, CreditCard, Package, Star, Activity,
  Clock, ChevronRight, ArrowRight,
} from "lucide-react";

export default function CasesPage() {
  const [view, setView] = useState<"cases" | "customers">("cases");
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState<CaseStatus | "all">("all");
  const [sel, setSel] = useState<Case | null>(null);

  const filtered = useMemo(() =>
    CASES.filter((c) =>
      (!search || c.customer.includes(search) || c.id.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)) &&
      (sf === "all" || c.status === sf)
    ), [search, sf]);

  const counts = useMemo(() => {
    const o: Record<string, number> = { all: CASES.length };
    (Object.keys(STATUS_MAP) as CaseStatus[]).forEach((s) => {
      o[s] = CASES.filter((c) => c.status === s).length;
    });
    return o;
  }, []);

  const custs = useMemo(() => {
    const map: Record<string, { name: string; phone: string; pref: string; cases: Case[]; total: number; last: string; cats: Set<string> }> = {};
    CASES.forEach((c) => {
      if (!map[c.customer]) map[c.customer] = { name: c.customer, phone: c.phone, pref: c.pref, cases: [], total: 0, last: c.date, cats: new Set() };
      map[c.customer].cases.push(c);
      map[c.customer].total += c.amount;
      map[c.customer].cats.add(c.category.label);
      if (c.date > map[c.customer].last) map[c.customer].last = c.date;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, []);

  const vipThreshold = custs.length > 2 ? custs[2].total : 0;

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="space-y-4 lg:space-y-5 animate-fade-in">
        {/* Header - hidden on mobile (shown in header bar) */}
        <div className="hidden lg:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">案件管理</h1>
            <p className="text-xs text-slate-400 mt-1">TimeTree のスケジュール管理を代替</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 self-start">
            <Plus size={16} /> 新規案件
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 lg:p-1.5 border border-slate-200/60 shadow-sm">
          {([["cases", "案件一覧", FileText], ["customers", "顧客一覧", Users]] as const).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setView(k as "cases" | "customers")} className={cn(
              "flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]",
              view === k ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}>
              <Icon size={16} /> {l}
            </button>
          ))}
        </div>

        {/* Cases View */}
        {view === "cases" && (
          <>
            {/* Search */}
            <Card className="p-3 lg:p-4">
              <SearchInput value={search} onChange={setSearch} placeholder="案件ID、顧客名、電話番号で検索..." />

              {/* Horizontal scrollable filter chips */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                <button onClick={() => setSf("all")} className={cn(
                  "shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 active:scale-95",
                  sf === "all" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-500 active:bg-slate-200"
                )}>
                  すべて <span className={cn("text-xs px-1.5 rounded-full", sf === "all" ? "bg-white/20" : "bg-slate-200/80")}>{counts.all}</span>
                </button>
                {(Object.entries(STATUS_MAP) as [CaseStatus, { label: string; className: string }][]).map(([k, v]) => (
                  <button key={k} onClick={() => setSf(k)} className={cn(
                    "shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 active:scale-95",
                    sf === k ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-500 active:bg-slate-200"
                  )}>
                    {v.label} <span className={cn("text-xs px-1.5 rounded-full", sf === k ? "bg-white/20" : "bg-slate-200/80")}>{counts[k]}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Mobile: Card List */}
            <div className="lg:hidden space-y-2">
              {filtered.slice(0, 15).map((c) => (
                <Card
                  key={c.id}
                  className="p-4 active:bg-slate-50 transition-colors"
                  onClick={() => setSel(sel?.id === c.id ? null : c)}
                >
                  <div className="flex items-start gap-3">
                    {/* Category icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: c.category.color }}
                    >
                      {c.category.label[0]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-bold text-slate-800 truncate">{c.customer}</span>
                          {c.urgent && <Zap size={14} className="text-amber-500 shrink-0" />}
                          {c.lineAuto && <span className="shrink-0 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">LINE</span>}
                        </div>
                        <Badge className={cn(STATUS_MAP[c.status].className, "shrink-0")}>{STATUS_MAP[c.status].label}</Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="font-mono">{c.id}</span>
                        <span className="flex items-center gap-0.5"><MapPin size={11} />{c.pref}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />{c.date.slice(5)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />{c.time}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                          {c.amount > 0 ? fmt(c.amount) : <span className="text-slate-300 font-normal">未確定</span>}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight size={16} className="text-slate-300 shrink-0 mt-3" />
                  </div>
                </Card>
              ))}

              {/* Load more */}
              {filtered.length > 15 && (
                <button className="w-full py-3 text-sm text-indigo-600 font-medium bg-white rounded-2xl border border-slate-200/60 active:bg-slate-50">
                  もっと表示（残り{filtered.length - 15}件）
                </button>
              )}
            </div>

            {/* Desktop: Table */}
            <Card className="overflow-hidden hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["案件ID", "顧客名", "カテゴリ", "エリア", "日時", "ステータス", "金額", "担当"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 15).map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors cursor-pointer" onClick={() => setSel(sel?.id === c.id ? null : c)}>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-mono font-medium text-indigo-600">{c.id}</span>
                          {c.urgent && <Zap size={14} className="inline ml-1 text-amber-500" />}
                          {c.lineAuto && <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">LINE</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-medium text-slate-800">{c.customer}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1"><Phone size={12} />{c.phone}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: c.category.color + "20" }}>
                              <span className="text-[10px] font-bold" style={{ color: c.category.color }}>{c.category.label[0]}</span>
                            </div>
                            <span className="text-sm text-slate-600">{c.category.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600"><MapPin size={14} className="inline text-slate-400 mr-1" />{c.pref}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600"><div>{c.date}</div><div className="text-xs text-slate-400">{c.time}</div></td>
                        <td className="px-5 py-3.5"><Badge className={STATUS_MAP[c.status].className}>{STATUS_MAP[c.status].label}</Badge></td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{c.amount > 0 ? fmt(c.amount) : <span className="text-slate-300">—</span>}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{c.staff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">1-15 / {filtered.length}件</p>
                <div className="flex gap-1">
                  {[1, 2, 3].map((p) => (
                    <button key={p} className={cn("w-8 h-8 rounded-lg text-sm font-medium", p === 1 ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100")}>{p}</button>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Customers View */}
        {view === "customers" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <StatCard icon={Users} label="総顧客数" value={`${custs.length}名`} accent="bg-gradient-to-br from-indigo-500 to-indigo-600" />
              <StatCard icon={Star} label="VIP顧客" value={`${custs.filter((c) => c.total >= vipThreshold).length}名`} accent="bg-gradient-to-br from-amber-500 to-amber-600" />
              <StatCard icon={Activity} label="平均売上" value={fmt(Math.round(custs.reduce((s, c) => s + c.total, 0) / (custs.length || 1)))} accent="bg-gradient-to-br from-emerald-500 to-emerald-600" />
              <StatCard icon={Activity} label="リピーター" value={`${custs.filter((c) => c.cases.length >= 15).length}名`} accent="bg-gradient-to-br from-violet-500 to-violet-600" />
            </div>

            {/* Search */}
            <Card className="p-3 lg:p-4">
              <SearchInput value={search} onChange={setSearch} placeholder="顧客名・電話番号で検索..." />
            </Card>

            {/* Mobile: Customer Card List */}
            <div className="lg:hidden space-y-2">
              {custs.filter((c) => !search || c.name.includes(search) || c.phone.includes(search)).slice(0, 30).map((c, i) => {
                const colors = ["bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
                return (
                  <Card key={c.name} className="p-4 active:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0", colors[i % 6])}>
                        {c.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 truncate">{c.name}</span>
                          {c.total >= vipThreshold && <Badge className="bg-amber-100 text-amber-700 border border-amber-200 shrink-0"><Star size={10} />VIP</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="font-mono">{c.phone}</span>
                          <span>{c.pref}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-slate-800">{fmt(c.total)}</div>
                        <div className="text-xs text-slate-400">{c.cases.length}件</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div className="flex gap-1.5">
                        {c.cases.length >= 15
                          ? <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">リピーター</Badge>
                          : c.cases.length >= 10
                          ? <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">複数利用</Badge>
                          : <Badge className="bg-slate-50 text-slate-500 border border-slate-200">一般</Badge>
                        }
                      </div>
                      <span className="text-xs text-slate-400">最終: {c.last.slice(5)}</span>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Desktop: Table */}
            <Card className="overflow-hidden hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-slate-100">
                    {["", "顧客名", "電話番号", "エリア", "案件数", "総売上", "最終利用", "ステータス"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {custs.filter((c) => !search || c.name.includes(search) || c.phone.includes(search)).slice(0, 30).map((c, i) => {
                      const colors = ["bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
                      return (
                        <tr key={c.name} className="border-b border-slate-50 hover:bg-slate-50/80">
                          <td className="px-4 py-3 text-center">
                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold", colors[i % 6])}>
                              {c.name.slice(0, 2)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-800">{c.name}</span>
                              {c.total >= vipThreshold && <Badge className="bg-amber-100 text-amber-700 border border-amber-200"><Star size={10} />VIP</Badge>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-mono">{c.phone}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{c.pref}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">{c.cases.length}件</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-900">{fmt(c.total)}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{c.last.slice(5)}</td>
                          <td className="px-4 py-3">
                            {c.cases.length >= 15
                              ? <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">リピーター</Badge>
                              : c.cases.length >= 10
                              ? <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">複数利用</Badge>
                              : <Badge className="bg-slate-50 text-slate-500 border border-slate-200">一般</Badge>
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

        {/* Detail Bottom Sheet / Modal */}
        <BottomSheet open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.id} — ${sel.customer}` : ""}>
          {sel && (
            <>
              {/* Category header */}
              <div className="flex items-center gap-3 px-5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: sel.category.color }}>
                  {sel.category.label[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{sel.category.label}</p>
                  <Badge className={STATUS_MAP[sel.status].className}>{STATUS_MAP[sel.status].label}</Badge>
                </div>
              </div>

              {/* Detail fields */}
              <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                {[
                  { icon: User, l: "顧客名", v: sel.customer },
                  { icon: Phone, l: "電話番号", v: sel.phone },
                  { icon: MapPin, l: "住所", v: sel.addr },
                  { icon: Calendar, l: "日時", v: `${sel.date} ${sel.time}` },
                  { icon: Activity, l: "金額", v: sel.amount > 0 ? fmt(sel.amount) : "未確定" },
                  { icon: User, l: "担当スタッフ", v: sel.staff },
                  { icon: CreditCard, l: "決済方法", v: sel.payMethod === "credit" ? "クレジット" : sel.payMethod === "cash" ? "現金" : "—" },
                  { icon: Package, l: "品目", v: sel.items.join("、") },
                ].map(({ icon: II, l, v }) => (
                  <div key={l} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <II size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-slate-400">{l}</p><p className="text-sm font-medium text-slate-700">{v}</p></div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 px-4 lg:px-6 pb-4 lg:pb-6">
                <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium active:bg-indigo-700 transition-colors">
                  ステータス更新
                </button>
                <button className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium active:bg-slate-50 transition-colors">
                  編集
                </button>
              </div>

              {/* Quick call button - mobile */}
              <div className="lg:hidden px-4 pb-4">
                <a
                  href={`tel:${sel.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-xl text-sm font-medium active:bg-green-600 transition-colors"
                >
                  <Phone size={16} /> 電話をかける
                </a>
              </div>
            </>
          )}
        </BottomSheet>
      </div>
    </PullToRefresh>
  );
}
