"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CASES } from "@/lib/mock-data";
import { STATUS_MAP } from "@/lib/constants";
import { cn, fmt } from "@/lib/utils";
import { Calendar, Plus, ChevronLeft, ChevronRight, Zap, Clock, MapPin } from "lucide-react";

export default function CalendarPage() {
  const [cur, setCur] = useState(new Date(2026, 1, 1));
  const y = cur.getFullYear(), m = cur.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const fd = new Date(y, m, 1).getDay();
  const ms = `${y}-${String(m + 1).padStart(2, "0")}`;

  const cByDate = useMemo(() => {
    const map: Record<string, typeof CASES> = {};
    CASES.forEach((c) => { if (!map[c.date]) map[c.date] = []; map[c.date].push(c); });
    return map;
  }, []);

  const days: (number | null)[] = [];
  for (let i = 0; i < fd; i++) days.push(null);
  for (let i = 1; i <= dim; i++) days.push(i);

  const [selDay, setSelDay] = useState(13);

  const mn = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const dn = ["日", "月", "火", "水", "木", "金", "土"];
  const isToday = (d: number) => d === 13 && m === 1 && y === 2026;
  const selDateStr = `${ms}-${String(selDay).padStart(2, "0")}`;
  const selCases = cByDate[selDateStr] || [];

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="space-y-4 lg:space-y-5 animate-fade-in">
        {/* Header - desktop only */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">スケジュール管理</h1>
            <p className="text-xs text-slate-400 mt-1">TimeTree のカレンダーを完全代替</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
            <Plus size={16} /> 予定追加
          </button>
        </div>

        {/* Calendar */}
        <Card className="p-3 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCur(new Date(y, m - 1, 1))} className="p-2.5 rounded-xl active:bg-slate-100 hover:bg-slate-100">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-base lg:text-lg font-bold text-slate-800">{y}年 {mn[m]}</h2>
            <button onClick={() => setCur(new Date(y, m + 1, 1))} className="p-2.5 rounded-xl active:bg-slate-100 hover:bg-slate-100">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day header */}
          <div className="grid grid-cols-7 mb-1">
            {dn.map((d, i) => (
              <div key={d} className={cn("py-2 text-center text-xs font-semibold",
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400")}>{d}</div>
            ))}
          </div>

          {/* Mobile: compact calendar */}
          <div className="grid grid-cols-7 gap-0.5 lg:hidden">
            {days.map((d, i) => {
              const ds = d ? `${ms}-${String(d).padStart(2, "0")}` : null;
              const dc = ds ? (cByDate[ds] || []) : [];
              const dow = i % 7;
              const isSelected = d === selDay;
              return (
                <button
                  key={i}
                  onClick={() => d && setSelDay(d)}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative",
                    !d && "invisible",
                    isSelected && "bg-indigo-600 text-white",
                    isToday(d!) && !isSelected && "bg-indigo-50",
                    !isSelected && !!d && "active:bg-slate-100"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-white" :
                    isToday(d!) ? "text-indigo-600 font-bold" :
                    dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-slate-700"
                  )}>
                    {d}
                  </span>
                  {dc.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dc.slice(0, 3).map((_, j) => (
                        <div key={j} className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white/70" : "bg-indigo-400")} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop: full calendar */}
          <div className="hidden lg:grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
            {days.map((d, i) => {
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
                            {c.urgent && <Zap size={10} />}
                            <span className="truncate font-medium">{c.time} {c.customer}</span>
                          </div>
                        ))}
                        {dc.length > 3 && <div className="text-[10px] text-slate-400 pl-1.5">+{dc.length - 3}件</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Day schedule */}
        <Card className="p-4 lg:p-5">
          <h3 className="font-bold text-slate-800 mb-3 lg:mb-4 text-sm lg:text-base">
            {m + 1}月{selDay}日の予定
            {selCases.length > 0 && <span className="ml-2 text-xs font-normal text-slate-400">{selCases.length}件</span>}
          </h3>
          {selCases.length > 0 ? (
            <div className="space-y-2">
              {selCases.slice(0, 8).map((c) => (
                <div key={c.id} className="flex items-center gap-3 lg:gap-4 p-3 rounded-xl active:bg-slate-50 hover:bg-slate-50 border border-slate-100 transition-colors">
                  <div className="text-center min-w-[44px]">
                    <div className="text-sm font-bold text-slate-800">{c.time}</div>
                  </div>
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ background: c.category.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-800">{c.customer}</span>
                      <Badge className={STATUS_MAP[c.status].className}>{STATUS_MAP[c.status].label}</Badge>
                      {c.urgent && <Badge className="bg-amber-100 text-amber-700 border border-amber-200">緊急</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{c.category.label}</span>
                      <span className="flex items-center gap-0.5"><MapPin size={10} />{c.pref}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 hidden sm:inline">{c.amount > 0 ? fmt(c.amount) : ""}</span>
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
