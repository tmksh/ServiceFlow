"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CASES } from "@/lib/mock-data";
import { STATUS_MAP } from "@/lib/constants";
import { cn, fmt } from "@/lib/utils";
import { Plus, ChevronLeft, ChevronRight, MapPin, Star, LayoutGrid, Bell, ChevronDown } from "lucide-react";

// ステータス別カラー（TimeTree風）
const ST: Record<string, { bg: string; fg: string; icon: string; short: string }> = {
  new:        { bg: "#6366f1", fg: "#fff", icon: "新",  short: "新規" },
  estimate:   { bg: "#8b5cf6", fg: "#fff", icon: "見",  short: "見積" },
  confirmed:  { bg: "#3b82f6", fg: "#fff", icon: "確",  short: "確定" },
  inProgress: { bg: "#f59e0b", fg: "#fff", icon: "対",  short: "対応" },
  completed:  { bg: "#10b981", fg: "#fff", icon: "済",  short: "完了" },
  cancelled:  { bg: "#ef4444", fg: "#fff", icon: "×",  short: "キャン" },
};

export default function CalendarPage() {
  const [cur, setCur] = useState(new Date(2026, 1, 1));
  const y = cur.getFullYear(), m = cur.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const fd = new Date(y, m, 1).getDay(); // 0=Sun
  const startOffset = (fd + 6) % 7;     // Mon=0
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
  while (days.length % 7 !== 0) days.push(null);
  const weeks = Math.ceil(days.length / 7);

  const [selDay, setSelDay] = useState(13);

  const mn = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const dn = ["月", "火", "水", "木", "金", "土", "日"];
  const isToday = (d: number) => d === 13 && m === 1 && y === 2026;
  const selDateStr = `${ms}-${String(selDay).padStart(2, "0")}`;
  const selCases = (cByDate[selDateStr] || []).sort((a, b) => a.time.localeCompare(b.time));

  const getDow = (d: number) => (new Date(y, m, d).getDay() + 6) % 7; // Mon=0..Sun=6

  return (
    <PullToRefresh onRefresh={() => {}}>
      {/* ===== モバイル（全画面TimeTreeレイアウト） ===== */}
      <div className="lg:hidden -mx-4 -mt-4 flex flex-col h-[calc(100vh-56px-64px)]">

        {/* ── アプリヘッダー ── */}
        <div className="bg-teal-600 text-white px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-bold tracking-tight">SF</div>
            <div>
              <div className="flex items-center gap-0.5 leading-none">
                <span className="text-[15px] font-bold">{y}年{mn[m]}</span>
                <ChevronDown size={13} className="opacity-70 mt-0.5" />
              </div>
              <div className="text-[11px] opacity-70 leading-tight">不用品回収　チーム神奈川</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Star size={19} className="opacity-80" />
            <LayoutGrid size={19} className="opacity-80" />
          </div>
        </div>

        {/* ── 曜日ヘッダー（固定） ── */}
        <div className="bg-white grid grid-cols-7 border-b border-slate-200 shrink-0">
          {dn.map((d, i) => (
            <div key={d} className={cn(
              "py-1 text-center text-[11px] font-semibold",
              i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-slate-500"
            )}>{d}</div>
          ))}
        </div>

        {/* ── カレンダーグリッド（スクロール） ── */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* 前月末尾 + 当月グリッド */}
          <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${weeks}, auto)` }}>
            {days.map((d, i) => {
              const ds = d ? `${ms}-${String(d).padStart(2, "0")}` : null;
              const dc = ds ? (cByDate[ds] || []) : [];
              const isSelected = d === selDay;
              const today = !!d && isToday(d);
              const dow = d ? getDow(d) : i % 7;
              const isSun = dow === 6;
              const isSat = dow === 5;
              const weekRow = Math.floor(i / 7);
              const isLastWeek = weekRow === weeks - 1;

              return (
                <button
                  key={i}
                  onClick={() => d && setSelDay(d)}
                  className={cn(
                    "flex flex-col p-0 border-b border-r border-slate-100 text-left align-top",
                    !d && "bg-slate-50/40",
                    isSelected && "bg-teal-50/80",
                    isLastWeek && "border-b-0",
                    isSun && "border-r-0",
                    !!d && !isSelected && "active:bg-slate-50/60"
                  )}
                >
                  {d && (
                    <div className="flex flex-col w-full">
                      {/* 日付数字 */}
                      <div className="flex justify-center pt-1 pb-0.5">
                        <span className={cn(
                          "w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold leading-none",
                          today        ? "bg-teal-500 text-white" :
                          isSelected   ? "bg-teal-200 text-teal-800" :
                          isSat        ? "text-blue-500" :
                          isSun        ? "text-red-500" : "text-slate-700"
                        )}>
                          {d}
                        </span>
                      </div>

                      {/* イベントタグ（全件表示） */}
                      {dc.length > 0 && (
                        <div className="flex flex-col gap-[2px] px-[2px] pb-1 w-full">
                          {dc.map((c) => {
                            const s = ST[c.status];
                            const lastName = c.customer.split(" ")[1] ?? c.customer.split(" ")[0];
                            return (
                              <div
                                key={c.id}
                                className="flex items-center w-full rounded-[2px] px-[3px] py-[1.5px] gap-[2px] overflow-hidden"
                                style={{ backgroundColor: s.bg }}
                              >
                                {c.urgent && (
                                  <span className="text-white text-[7px] font-black leading-none shrink-0">▲</span>
                                )}
                                <span
                                  className="text-[8px] font-semibold leading-tight truncate"
                                  style={{ color: s.fg }}
                                >
                                  {lastName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── 選択日の予定リスト ── */}
          <div className="border-t-4 border-teal-500 bg-white">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">
                {m + 1}月{selDay}日の予定
                {selCases.length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-slate-500">{selCases.length}件</span>
                )}
              </span>
              <button className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shadow active:bg-teal-600">
                <Plus size={16} className="text-white" />
              </button>
            </div>

            {selCases.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {selCases.map((c) => {
                  const s = ST[c.status];
                  return (
                    <div key={c.id} className="flex items-stretch active:bg-slate-50">
                      <div className="w-[3px] shrink-0" style={{ backgroundColor: s.bg }} />
                      <div className="flex items-center gap-2.5 px-3 py-2.5 flex-1 min-w-0">
                        <div className="min-w-[40px] text-center shrink-0">
                          <div className="text-xs font-bold text-slate-700">{c.time}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800 truncate">{c.customer}</span>
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ backgroundColor: s.bg + "22", color: s.bg }}
                            >
                              {STATUS_MAP[c.status].label}
                            </span>
                            {c.urgent && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 shrink-0">
                                ▲ 緊急
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                            <span>{c.category.label}</span>
                            <span className="flex items-center gap-0.5"><MapPin size={9} />{c.pref}</span>
                            {c.staff && <span>{c.staff}</span>}
                          </p>
                        </div>
                        {c.amount > 0 && (
                          <div className="shrink-0">
                            <span className="text-xs font-semibold text-slate-600">{fmt(c.amount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                <Bell size={24} className="mx-auto mb-1.5 opacity-25" />
                この日の予定はありません
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== デスクトップ ===== */}
      <div className="hidden lg:block space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">スケジュール管理</h1>
            <p className="text-xs text-slate-400 mt-1">TimeTree のカレンダーを完全代替</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
            <Plus size={16} /> 予定追加
          </button>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCur(new Date(y, m - 1, 1))} className="p-2.5 rounded-xl hover:bg-slate-100">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">{y}年 {mn[m]}</h2>
            <button onClick={() => setCur(new Date(y, m + 1, 1))} className="p-2.5 rounded-xl hover:bg-slate-100">
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
              const ddays: (number | null)[] = [];
              for (let i = 0; i < fd; i++) ddays.push(null);
              for (let i = 1; i <= dim; i++) ddays.push(i);
              return ddays.map((d, i) => {
                const ds = d ? `${ms}-${String(d).padStart(2, "0")}` : null;
                const dc = ds ? (cByDate[ds] || []) : [];
                const dow = i % 7;
                return (
                  <div key={i}
                    className={cn("min-h-[100px] bg-white p-1.5 hover:bg-slate-50 cursor-pointer", !d && "bg-slate-50/50")}
                    onClick={() => d && setSelDay(d)}>
                    {d && (
                      <>
                        <div className={cn("w-7 h-7 flex items-center justify-center rounded-lg text-sm font-medium mb-1",
                          isToday(d) ? "bg-indigo-600 text-white" : dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-slate-700")}>
                          {d}
                        </div>
                        <div className="space-y-0.5">
                          {dc.slice(0, 3).map((c) => (
                            <div key={c.id}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate"
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

        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4 text-base">
            {m + 1}月{selDay}日の予定
            {selCases.length > 0 && <span className="ml-2 text-xs font-normal text-slate-400">{selCases.length}件</span>}
          </h3>
          {selCases.length > 0 ? (
            <div className="space-y-2">
              {selCases.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-slate-100">
                  <div className="min-w-[44px] text-center">
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
