"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { SETTLEMENTS } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/utils";
import {
  Calendar, ChevronLeft, ChevronRight, Download,
  Zap, Check, XCircle, CreditCard,
} from "lucide-react";

export default function SettlementPage() {
  const cashTotal = SETTLEMENTS.filter((s) => s.pay !== "cancel").reduce((sum, s) => sum + s.amount, 0);
  const creditTotal = SETTLEMENTS.filter((s) => s.creditExtra).reduce((sum, s) => sum + (s.creditExtra || 0), 0);
  const grandTotal = cashTotal + creditTotal;
  const cancelCount = SETTLEMENTS.filter((s) => s.pay === "cancel").length;

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="space-y-4 lg:space-y-5 animate-fade-in">
        {/* Header - desktop only */}
        <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">日報・精算</h1>
            <p className="text-xs text-slate-400 mt-1">精算 → スプレッドシートの手入力を自動化</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">
              <ChevronLeft size={16} /> 前日
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
              <Calendar size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">2026/02/13</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">
              翌日 <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Mobile: date navigation */}
        <div className="flex items-center justify-between lg:hidden">
          <button className="p-2.5 rounded-xl active:bg-slate-100 border border-slate-200">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
            <Calendar size={14} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">2026/02/13</span>
          </div>
          <button className="p-2.5 rounded-xl active:bg-slate-100 border border-slate-200">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard icon={CreditCard} label="売上合計" value={fmt(grandTotal)} accent="bg-gradient-to-br from-indigo-500 to-indigo-600" />
          <StatCard icon={CreditCard} label="現金売上" value={fmt(cashTotal)} accent="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <StatCard icon={CreditCard} label="クレジット" value={fmt(creditTotal)} accent="bg-gradient-to-br from-violet-500 to-violet-600" />
          <StatCard icon={XCircle} label="キャンセル" value={`${cancelCount}件`} accent="bg-gradient-to-br from-red-400 to-red-500" />
        </div>

        {/* Mobile: Card list */}
        <div className="lg:hidden space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <h3 className="font-bold text-slate-800 text-sm">スタッフ別精算</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium active:bg-indigo-700">
              <Download size={12} /> 出力
            </button>
          </div>
          {SETTLEMENTS.map((s, i) => (
            <Card key={i} className={cn("p-4 active:bg-slate-50 transition-colors", s.pay === "cancel" && "border-red-200 bg-red-50/30")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {s.staff[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{s.staff}</span>
                    {s.pay === "cash" && <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">現金</Badge>}
                    {s.pay === "mixed" && <Badge className="bg-violet-50 text-violet-700 border border-violet-200">現金+クレジット</Badge>}
                    {s.pay === "cancel" && <Badge className="bg-red-50 text-red-700 border border-red-200">キャンセル</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{s.customer}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400">金額</span>
                    <p className="font-bold text-slate-900">{s.pay === "cancel" ? "—" : fmt(s.amount)}</p>
                  </div>
                  {s.creditExtra && (
                    <div>
                      <span className="text-xs text-slate-400">クレジット分</span>
                      <p className="font-medium text-violet-600">+{fmt(s.creditExtra)}</p>
                    </div>
                  )}
                </div>
                {s.pay !== "cancel" ? <Check size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
              </div>
            </Card>
          ))}

          {/* Total card */}
          <Card className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">合計</span>
              <span className="text-xl font-bold text-indigo-600">{fmt(grandTotal)}</span>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span>現金: {fmt(cashTotal)}</span>
              <span>クレジット: {fmt(creditTotal)}</span>
            </div>
          </Card>
        </div>

        {/* Desktop: Table */}
        <Card className="overflow-hidden hidden lg:block">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">スタッフ別精算</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
              <Download size={14} /> スプレッドシート出力
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["担当", "顧客名", "金額", "クレジット分", "決済方法", "ステータス"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SETTLEMENTS.map((s, i) => (
                  <tr key={i} className={cn("border-b border-slate-50", s.pay === "cancel" && "bg-red-50/30")}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">{s.staff[0]}</div>
                        <span className="text-sm font-medium text-slate-800">{s.staff}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{s.customer}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-900">{s.pay === "cancel" ? "—" : fmt(s.amount)}</td>
                    <td className="px-5 py-3.5 text-sm text-violet-600 font-medium">{s.creditExtra ? `+${fmt(s.creditExtra)}` : "—"}</td>
                    <td className="px-5 py-3.5">
                      {s.pay === "cash" && <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">現金</Badge>}
                      {s.pay === "mixed" && <Badge className="bg-violet-50 text-violet-700 border border-violet-200">現金+クレジット</Badge>}
                      {s.pay === "cancel" && <Badge className="bg-red-50 text-red-700 border border-red-200">キャンセル</Badge>}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.pay !== "cancel" ? <Check size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold">
                  <td className="px-5 py-4 text-sm text-slate-800" colSpan={2}>合計</td>
                  <td className="px-5 py-4 text-sm text-slate-900">{fmt(cashTotal)}</td>
                  <td className="px-5 py-4 text-sm text-violet-600">{fmt(creditTotal)}</td>
                  <td className="px-5 py-4 text-lg text-indigo-600" colSpan={2}>{fmt(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Auto summary */}
        <Card className="p-4 lg:p-5 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="p-2 lg:p-2.5 bg-indigo-500 rounded-xl shrink-0"><Zap size={18} className="text-white" /></div>
            <div>
              <h3 className="font-bold text-indigo-900 text-sm lg:text-base">自動集計完了</h3>
              <p className="text-xs lg:text-sm text-indigo-600">本日の精算データはスプレッドシート形式で自動保存されました。</p>
            </div>
          </div>
        </Card>
      </div>
    </PullToRefresh>
  );
}
