"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { SETTLEMENTS, CASES } from "@/lib/mock-data";
import { STAFF } from "@/lib/constants";
import { cn, fmt } from "@/lib/utils";
import {
  Calendar, ChevronLeft, ChevronRight, Download, Zap,
  Check, XCircle, CreditCard, FileText, Camera,
  Clock, MapPin, Truck, Phone, Star,
} from "lucide-react";

type SettlementTab = "settlement" | "report";

const REPORT_DATA = [
  { staff: "田中", caseId: "CS-0023", customer: "あかざわ たつゆき", cat: "不用品回収", addr: "神奈川県逗子市", startTime: "10:00", endTime: "12:30", travelKm: 18, travelCost: 1800, rating: 5, memo: "スムーズに完了。お客様大変満足。" },
  { staff: "佐藤", caseId: "CS-0031", customer: "ほり せいこ",   cat: "ハウスクリーニング", addr: "東京都世田谷区", startTime: "13:00", endTime: "17:00", travelKm: 12, travelCost: 1200, rating: 4, memo: "エアコン追加対応あり" },
  { staff: "鈴木", caseId: "CS-0041", customer: "みやた こうき",  cat: "引っ越し", addr: "東京都新宿区", startTime: "09:00", endTime: "15:30", travelKm: 25, travelCost: 2500, rating: 5, memo: "" },
  { staff: "高橋", caseId: "CS-0018", customer: "すずき たろう",  cat: "不用品回収", addr: "千葉県船橋市", startTime: "11:00", endTime: "13:00", travelKm: 30, travelCost: 3000, rating: 3, memo: "渋滞で30分遅延" },
];

export default function SettlementPage() {
  const [activeTab, setActiveTab] = useState<SettlementTab>("settlement");
  const [dateOffset, setDateOffset] = useState(0);

  const baseDate = new Date(2026, 1, 13);
  baseDate.setDate(baseDate.getDate() + dateOffset);
  const dateLabel = `${baseDate.getFullYear()}/${String(baseDate.getMonth() + 1).padStart(2, "0")}/${String(baseDate.getDate()).padStart(2, "0")}`;

  const cashTotal = SETTLEMENTS.filter((s) => s.pay !== "cancel").reduce((sum, s) => sum + s.amount, 0);
  const creditTotal = SETTLEMENTS.filter((s) => s.creditExtra).reduce((sum, s) => sum + (s.creditExtra || 0), 0);
  const grandTotal = cashTotal + creditTotal;
  const cancelCount = SETTLEMENTS.filter((s) => s.pay === "cancel").length;
  const totalTravelCost = REPORT_DATA.reduce((s, r) => s + r.travelCost, 0);

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="space-y-4 lg:space-y-5 animate-fade-in">

        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-slate-900">日報・精算</h1>
            <p className="text-xs text-slate-400 mt-1">精算 → スプレッドシートの手入力を自動化</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDateOffset((d) => d - 1)} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors">
              <ChevronLeft size={17} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
              <Calendar size={14} className="text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">{dateLabel}</span>
            </div>
            <button onClick={() => setDateOffset((d) => d + 1)} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors">
              <ChevronRight size={17} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-slate-200/60 shadow-sm w-fit">
          {([["settlement", "精算管理", CreditCard], ["report", "作業報告", FileText]] as [SettlementTab, string, React.ElementType][]).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                activeTab === k ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}>
              <Icon size={14} />{l}
            </button>
          ))}
        </div>

        {/* ===== 精算管理タブ ===== */}
        {activeTab === "settlement" && (
          <>
            {/* KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { l: "売上合計",   v: fmt(grandTotal), color: "text-indigo-600",  bg: "bg-indigo-50",  icon: CreditCard },
                { l: "現金売上",   v: fmt(cashTotal),  color: "text-emerald-600", bg: "bg-emerald-50", icon: Check },
                { l: "クレジット", v: fmt(creditTotal),color: "text-violet-600",  bg: "bg-violet-50",  icon: CreditCard },
                { l: "キャンセル", v: `${cancelCount}件`, color: "text-red-500",  bg: "bg-red-50",     icon: XCircle },
              ].map((k) => (
                <div key={k.l} className="flex items-center gap-2.5 px-3 py-3 bg-white border border-slate-200/60 rounded-xl shadow-sm">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", k.bg)}>
                    <k.icon size={15} className={k.color} />
                  </div>
                  <div><p className={cn("text-sm font-bold", k.color)}>{k.v}</p><p className="text-[10px] text-slate-400">{k.l}</p></div>
                </div>
              ))}
            </div>

            {/* テーブル（デスクトップ） */}
            <Card glass={false} className="overflow-hidden hidden lg:block">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">スタッフ別精算</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                  <Download size={13} /> スプレッドシート出力
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
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
                          {s.pay === "cash"   && <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">現金</Badge>}
                          {s.pay === "mixed"  && <Badge className="bg-violet-50 text-violet-700 border border-violet-200">現金+クレジット</Badge>}
                          {s.pay === "cancel" && <Badge className="bg-red-50 text-red-700 border border-red-200">キャンセル</Badge>}
                        </td>
                        <td className="px-5 py-3.5">
                          {s.pay !== "cancel" ? <Check size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                      <td className="px-5 py-4 text-sm text-slate-800" colSpan={2}>合計</td>
                      <td className="px-5 py-4 text-sm text-slate-900">{fmt(cashTotal)}</td>
                      <td className="px-5 py-4 text-sm text-violet-600">{fmt(creditTotal)}</td>
                      <td className="px-5 py-4 text-lg text-indigo-700 font-bold" colSpan={2}>{fmt(grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>

            {/* カードリスト（モバイル） */}
            <div className="space-y-2 lg:hidden">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-800 text-sm">スタッフ別精算</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium">
                  <Download size={12} /> 出力
                </button>
              </div>
              {SETTLEMENTS.map((s, i) => (
                <Card key={i} className={cn("p-4", s.pay === "cancel" && "border-red-200 bg-red-50/30")}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{s.staff[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">{s.staff}</span>
                        {s.pay === "cash"   && <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">現金</Badge>}
                        {s.pay === "mixed"  && <Badge className="bg-violet-50 text-violet-700 border border-violet-200">現金+クレジット</Badge>}
                        {s.pay === "cancel" && <Badge className="bg-red-50 text-red-700 border border-red-200">キャンセル</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{s.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-sm">
                      <div><span className="text-xs text-slate-400">金額</span><p className="font-bold text-slate-900">{s.pay === "cancel" ? "—" : fmt(s.amount)}</p></div>
                      {s.creditExtra && (<div><span className="text-xs text-slate-400">クレジット</span><p className="font-medium text-violet-600">+{fmt(s.creditExtra)}</p></div>)}
                    </div>
                    {s.pay !== "cancel" ? <Check size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                  </div>
                </Card>
              ))}
              <Card glass={false} className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">合計</span>
                  <span className="text-xl font-bold text-indigo-600">{fmt(grandTotal)}</span>
                </div>
                <div className="flex gap-4 mt-1.5 text-xs text-slate-500">
                  <span>現金: {fmt(cashTotal)}</span>
                  <span>クレジット: {fmt(creditTotal)}</span>
                </div>
              </Card>
            </div>

            <Card glass={false} className="p-4 lg:p-5 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500 rounded-xl shrink-0"><Zap size={18} className="text-white" /></div>
                <div>
                  <h3 className="font-bold text-indigo-900">自動集計完了</h3>
                  <p className="text-sm text-indigo-600">本日の精算データはスプレッドシート形式で自動保存されました。手入力は不要です。</p>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ===== 作業報告タブ ===== */}
        {activeTab === "report" && (
          <>
            {/* KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { l: "完了件数",     v: `${REPORT_DATA.length}件`, color: "text-indigo-600",  bg: "bg-indigo-50",  icon: Check    },
                { l: "合計作業時間", v: `${REPORT_DATA.reduce((s, r) => s + (parseTime(r.endTime) - parseTime(r.startTime)), 0) / 60}時間`, color: "text-emerald-600", bg: "bg-emerald-50", icon: Clock },
                { l: "交通費合計",   v: fmt(totalTravelCost),     color: "text-amber-600",   bg: "bg-amber-50",   icon: Truck    },
                { l: "平均評価",     v: `${(REPORT_DATA.reduce((s, r) => s + r.rating, 0) / REPORT_DATA.length).toFixed(1)}⭐`,  color: "text-violet-600", bg: "bg-violet-50", icon: Star },
              ].map((k) => (
                <div key={k.l} className="flex items-center gap-2.5 px-3 py-3 bg-white border border-slate-200/60 rounded-xl shadow-sm">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", k.bg)}>
                    <k.icon size={15} className={k.color} />
                  </div>
                  <div><p className={cn("text-sm font-bold", k.color)}>{k.v}</p><p className="text-[10px] text-slate-400">{k.l}</p></div>
                </div>
              ))}
            </div>

            {/* 報告カード */}
            <div className="space-y-3">
              {REPORT_DATA.map((r, i) => (
                <Card key={i} className="p-4 lg:p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{r.staff[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{r.staff}</span>
                          <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{r.caseId}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <span key={si} className={cn("text-xs", si < r.rating ? "text-amber-400" : "text-slate-200")}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 font-medium mt-0.5">{r.customer}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={11} />{r.addr}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{r.startTime}〜{r.endTime}</span>
                        <span className="flex items-center gap-1"><Truck size={11} />{r.travelKm}km / {fmt(r.travelCost)}</span>
                      </div>
                      {r.memo && <p className="mt-2 text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{r.memo}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"><Camera size={12} />写真を見る</button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"><FileText size={12} />報告書を開く</button>
                  </div>
                </Card>
              ))}
            </div>

            <Card glass={false} className="p-4 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">交通費・経費集計</p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"><Download size={12} />CSV出力</button>
              </div>
              <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
                {REPORT_DATA.map((r) => (
                  <div key={r.staff} className="bg-white rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-700">{r.staff}</p>
                    <p className="text-sm font-bold text-amber-600 mt-1">{fmt(r.travelCost)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.travelKm}km</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </PullToRefresh>
  );
}

function parseTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
