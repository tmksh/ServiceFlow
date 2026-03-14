"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CASES } from "@/lib/mock-data";
import { STATUS_MAP } from "@/lib/constants";
import { cn, fmt } from "@/lib/utils";
import { Plus, ChevronLeft, ChevronRight, MapPin, Star, LayoutGrid, Bell } from "lucide-react";

// TimeTree風のステータスカラーマップ
const TT_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  new:        { bg: "#6366f1", text: "#fff", label: "新規" },
  estimate:   { bg: "#8b5cf6", text: "#fff", label: "見積" },
  confirmed:  { bg: "#3b82f6", text: "#fff", label: "確定" },
  inProgress: { bg: "#f59e0b", text: "#fff", label: "対応中" },
  completed:  { bg: "#10b981", text: "#fff", label: "完了" },
  cancelled:  { bg: "#ef4444", text: "#fff", label: "キャンセル" },
};

export default function CalendarPage() {
  const [cur, setCur] = useState(new Date(2026, 1, 1));
  const y = cur.getFullYear(), m = cur.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const fd = new Date(y, m, 1).getDay(); // 0=Sun
  // TimeTree: 月曜始まり
  const startOffset = (fd + 6) % 7; // Mon=0
  const ms = `${y}-${String(m + 1).padStart(2, "0")}`;

  const cByDate = useMemo(() => {
    const map: Record<string, typeof CASES> = {};
    CASES.forEach((c) => {
      if (!map[c.date]) map[c.date] = [];
      map[c.date].push(c);
    });
    return map;
  }, []);

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= dim; i++) days.push(i);
  // 末尾を7の倍数に
  while (days.length % 7 !== 0) days.push(null);

  const [selDay, setSelDay] = useState(13);

  const mn = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  // TimeTree: 月火水木金土日
  const dn = ["月", "火", "水", "木", "金", "土", "日"];
  const isToday = (d: number) => d === 13 && m === 1 && y === 2026;
  const selDateStr = `${ms}-${String(selDay).padStart(2, "0")}`;
  const selCases = (cByDate[selDateStr] || []).sort((a, b) => a.time.localeCompare(b.time));

  // 曜日インデックス (月始まり): 0=月,1=火,...,5=土,6=日
  const getDowMon = (d: number) => {
    const dow = new Date(y, m, d).getDay(); // 0=Sun
    return (dow + 6) % 7;
  };

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="lg:space-y-5 animate-fade-in -mx-4 lg:mx-0">

        {/* === TimeTree風モバイルヘッダー === */}
        <div className="lg:hidden bg-teal-600 text-white px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">SF</div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-bold">{y}年{mn[m]}</span>
                  <ChevronLeft size={14} className="opacity-60" />
                </div>
                <div className="text-xs opacity-75">不用品回収　チーム神奈川</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star size={20} className="opacity-80" />
              <LayoutGrid size={20} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* === デスクトップヘッダー === */}
        <div className="hidden lg:flex items-center justify-between px-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">スケジュール管理</h1>
            <p className="text-xs text-slate-400 mt-1">TimeTree のカレンダーを完全代替</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
            <Plus size={16} /> 予定追加
          </button>
        </div>

        {/* === TimeTree風カレンダーグリッド（モバイル） === */}
        <div className="lg:hidden bg-white">
          {/* 月ナビゲーション */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <button onClick={() => setCur(new Date(y, m - 1, 1))} className="p-1.5 rounded-lg active:bg-slate-100">
              <ChevronLeft size={18} className="text-slate-500" />
            </button>
            <span className="text-sm font-semibold text-slate-700">{y}年{mn[m]}</span>
            <button onClick={() => setCur(new Date(y, m + 1, 1))} className="p-1.5 rounded-lg active:bg-slate-100">
              <ChevronRight size={18} className="text-slate-500" />
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {dn.map((d, i) => (
              <div key={d} className={cn(
                "py-1.5 text-center text-[11px] font-semibold",
                i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-slate-500"
              )}>{d}</div>
            ))}
          </div>

          {/* カレンダーセル（TimeTree風） */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const ds = d ? `${ms}-${String(d).padStart(2, "0")}` : null;
              const dc = ds ? (cByDate[ds] || []) : [];
              const isSelected = d === selDay;
              const today = isToday(d!);
              const dowMon = d ? getDowMon(d) : i % 7;
              // 末尾行かどうか（下ボーダー不要）
              const isLastRow = i >= days.length - 7;

              return (
                <button
                  key={i}
                  onClick={() => d && setSelDay(d)}
                  className={cn(
                    "flex flex-col min-h-[72px] p-0.5 border-b border-r border-slate-100 text-left transition-colors",
                    !d && "bg-slate-50/60",
                    isSelected && "bg-teal-50",
                    isLastRow && "border-b-0",
                    i % 7 === 6 && "border-r-0",
                    !!d && !isSelected && "active:bg-slate-50"
                  )}
                >
                  {d && (
                    <>
                      {/* 日付 */}
                      <div className={cn(
                        "w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold mb-0.5 mx-auto",
                        today ? "bg-teal-500 text-white" :
                        isSelected ? "bg-teal-200 text-teal-800" :
                        dowMon === 5 ? "text-blue-500" :
                        dowMon === 6 ? "text-red-500" : "text-slate-700"
                      )}>
                        {d}
                      </div>

                      {/* イベントタグ（TimeTree風） */}
                      <div className="flex flex-col gap-px w-full px-0.5">
                        {dc.slice(0, 4).map((c) => {
                          const sc = TT_STATUS_COLORS[c.status];
                          const shortName = c.customer.split(" ")[1] || c.customer.split(" ")[0];
                          return (
                            <div
                              key={c.id}
                              className="flex items-center rounded-sm px-1 py-px gap-0.5 w-full"
                              style={{ backgroundColor: sc.bg }}
                            >
                              {c.urgent && (
                                <span className="text-white text-[8px] font-bold leading-none">▲</span>
                              )}
                              <span className="text-[9px] font-medium leading-tight truncate" style={{ color: sc.text }}>
                                {shortName}
                              </span>
                            </div>
                          );
                        })}
                        {dc.length > 4 && (
                          <div className="text-[9px] text-slate-400 text-center">+{dc.length - 4}</div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* === デスクトップ カレンダー === */}
        <Card className="hidden lg:block p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCur(new Date(y, m - 1, 1))} className="p-2.5 rounded-xl active:bg-slate-100 hover:bg-slate-100">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">{y}年 {mn[m]}</h2>
            <button onClick={() => setCur(new Date(y, m + 1, 1))} className="p-2.5 rounded-xl active:bg-slate-100 hover:bg-slate-100">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
              <div key={d} className={cn("py-2 text-center text-xs font-semibold",
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400")}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
            {(() => {
              const desktopDays: (number | null)[] = [];
              for (let i = 0; i < fd; i++) desktopDays.push(null);
              for (let i = 1; i <= dim; i++) desktopDays.push(i);
              return desktopDays.map((d, i) => {
                const ds = d ? `${ms}-${String(d).padStart(2, "0")}` : null;
                const dc = ds ? (cByDate[ds] || []) : [];
                const dow = i % 7;
                return (
                  <div key={i} className={cn("min-h-[100px] bg-white p-1.5 hover:bg-slate-50 cursor-pointer", !d && "bg-slate-50/50")}
                    onClick={() => d && setSelDay(d)}>
                    {d && (
                      <>
                        <div className={cn("w-7 h-7 flex items-center justify-center rounded-lg text-sm font-medium mb-1",
                          isToday(d) ? "bg-indigo-600 text-white" : dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-slate-700")}>
                          {d}
                        </div>
                        <div className="space-y-0.5">
                          {dc.slice(0, 3).map((c) => (
                            <div key={c.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate"
                              style={{ background: c.category.color + "15", color: c.category.color }}>
                              <span className="truncate font-medium">{c.time} {c.customer}</span>
                            </div>
                          ))}
                          {dc.length > 3 && <div className="text-[10px] text-slate-400 pl-1.5">+{dc.length - 3}件</div>}
                        </div>
                      </>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </Card>

        {/* === 選択日の予定リスト === */}
        <div className="lg:hidden bg-white border-t border-slate-100">
          {/* 日付ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div>
              <span className="text-sm font-bold text-slate-800">
                今日の予定 — {m + 1}月{selDay}日
              </span>
              {selCases.length > 0 && (
                <span className="ml-2 text-xs text-slate-500">{selCases.length}件</span>
              )}
            </div>
            <button className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center shadow-md active:bg-teal-600">
              <Plus size={18} className="text-white" />
            </button>
          </div>

          {selCases.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {selCases.map((c) => {
                const sc = TT_STATUS_COLORS[c.status];
                return (
                  <div key={c.id} className="flex items-stretch gap-0 active:bg-slate-50 transition-colors">
                    {/* 左の色バー */}
                    <div className="w-1 shrink-0 rounded-l" style={{ backgroundColor: sc.bg }} />
                    <div className="flex items-center gap-3 px-3 py-3 flex-1 min-w-0">
                      {/* 時刻 */}
                      <div className="min-w-[42px] text-center">
                        <div className="text-sm font-bold text-slate-700">{c.time}</div>
                      </div>
                      {/* メイン情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800 truncate">{c.customer}</span>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: sc.bg + "20", color: sc.bg }}
                          >
                            {STATUS_MAP[c.status].label}
                          </span>
                          {c.urgent && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 shrink-0">
                              ▲ 緊急
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 truncate">
                          <span>{c.category.label}</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin size={10} />{c.pref}
                          </span>
                          {c.staff && <span>担当: {c.staff}</span>}
                        </p>
                      </div>
                      {/* 金額 */}
                      {c.amount > 0 && (
                        <div className="shrink-0 text-right">
                          <div className="text-xs font-semibold text-slate-600">{fmt(c.amount)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-slate-400">
              <Bell size={28} className="mx-auto mb-2 opacity-30" />
              この日の予定はありません
            </div>
          )}
        </div>

        {/* デスクトップ用予定リスト */}
        <Card className="hidden lg:block p-5">
          <h3 className="font-bold text-slate-800 mb-4 text-base">
            {m + 1}月{selDay}日の予定
            {selCases.length > 0 && <span className="ml-2 text-xs font-normal text-slate-400">{selCases.length}件</span>}
          </h3>
          {selCases.length > 0 ? (
            <div className="space-y-2">
              {selCases.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                  <div className="text-center min-w-[44px]">
                    <div className="text-sm font-bold text-slate-800">{c.time}</div>
                  </div>
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ background: c.category.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-800">{c.customer}</span>
                      <Badge className={STATUS_MAP[c.status].className}>{STATUS_MAP[c.status].label}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{c.category.label}</span>
                      <span className="flex items-center gap-0.5"><MapPin size={10} />{c.pref}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{c.amount > 0 ? fmt(c.amount) : ""}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">この日の予定はありません</div>
          )}
        </Card>
      </div>
    </PullToRefresh>
  );
}
