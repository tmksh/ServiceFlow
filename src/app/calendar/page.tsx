"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CASES, CALENDAR_GROUPS } from "@/lib/mock-data";
import { STATUS_MAP } from "@/lib/constants";
import { cn, fmt } from "@/lib/utils";
import type { CalendarGroup } from "@/types";
import {
  Plus, ChevronLeft, ChevronRight, MapPin, Bell,
  ChevronDown, Lock, Eye, Edit3, Crown,
  Calendar, CalendarDays, Clock, Map,
} from "lucide-react";
import { DayMapModal } from "@/components/ui/day-map-modal";
import { CalendarGroupPickerModal } from "@/components/layout/list-picker-modal";
import { QuickCaseModal } from "@/components/ui/quick-case-modal";
import { useCalendarHeader } from "@/lib/calendar-header-context";
import type { Case } from "@/types";

type CalMode = "month" | "week" | "day";

// ステータス別カラー（TimeTree風）
const ST: Record<string, { bg: string; fg: string }> = {
  new:        { bg: "#6366f1", fg: "#fff" },
  estimate:   { bg: "#8b5cf6", fg: "#fff" },
  confirmed:  { bg: "#3b82f6", fg: "#fff" },
  inProgress: { bg: "#f59e0b", fg: "#fff" },
  completed:  { bg: "#10b981", fg: "#fff" },
  cancelled:  { bg: "#ef4444", fg: "#fff" },
};

const ROLE_ICON = {
  owner:  <Crown  size={12} className="text-amber-500" />,
  editor: <Edit3  size={12} className="text-blue-500" />,
  viewer: <Eye    size={12} className="text-slate-400" />,
  none:   <Lock   size={12} className="text-red-400" />,
};

// ─── 週ビュー ─────────────────────────────────────────────────────────────────
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => i + 7); // 7〜20時

function WeekView({
  cur, setCur, cByDate, accentColor, canEdit, ms,
}: {
  cur: Date; setCur: (d: Date) => void; cByDate: Record<string, typeof CASES>;
  accentColor: string; canEdit: boolean; ms: string;
}) {
  const y = cur.getFullYear(), m = cur.getMonth(), d = cur.getDate();
  const dow = (cur.getDay() + 6) % 7; // 月曜=0
  const weekStart = new Date(y, m, d - dow);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(weekStart); dt.setDate(weekStart.getDate() + i);
    return dt;
  });
  const dn = ["月","火","水","木","金","土","日"];
  const isToday = (dt: Date) => {
    const t = new Date(2026, 1, 13);
    return dt.getFullYear() === t.getFullYear() && dt.getMonth() === t.getMonth() && dt.getDate() === t.getDate();
  };

  const dateStr = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  const toHour = (timeStr: string) => parseInt(timeStr.split(":")[0] ?? "9", 10);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 liquid-glass">
      {/* ナビ */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/60">
        <button onClick={() => setCur(new Date(y, m, d - 7))} className="p-2 rounded-xl hover:bg-white/50 transition-colors">
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-slate-800">
            {weekDays[0].getMonth() + 1}月{weekDays[0].getDate()}日 〜 {weekDays[6].getMonth() + 1}月{weekDays[6].getDate()}日
          </span>
        </div>
        <button onClick={() => setCur(new Date(y, m, d + 7))} className="p-2 rounded-xl hover:bg-white/50 transition-colors">
          <ChevronRight size={18} className="text-slate-500" />
        </button>
      </div>

      {/* グリッド */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 640 }}>
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-white/60">
            <div className="border-r border-white/40" />
            {weekDays.map((dt, i) => (
              <div key={i} className={cn("py-2 text-center border-r border-white/40 last:border-0",
                isToday(dt) && "bg-indigo-50/50")}>
                <div className={cn("text-[10px] font-semibold", i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-slate-400")}>
                  {dn[i]}
                </div>
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mx-auto mt-0.5",
                  isToday(dt) ? "text-white" : "text-slate-700")}
                  style={isToday(dt) ? { backgroundColor: accentColor } : undefined}>
                  {dt.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* 時間スロット */}
          <div className="relative" style={{ height: TIME_SLOTS.length * 56 }}>
            {TIME_SLOTS.map((h) => (
              <div key={h} className="grid grid-cols-[48px_repeat(7,1fr)] absolute w-full" style={{ top: (h - 7) * 56, height: 56 }}>
                <div className="border-r border-b border-white/40 flex items-start justify-end pr-2 pt-1">
                  <span className="text-[10px] text-slate-400">{h}:00</span>
                </div>
                {weekDays.map((dt, di) => (
                  <div key={di} className={cn("border-r border-b border-white/40 last:border-r-0 relative",
                    isToday(dt) && "bg-indigo-50/20")}>
                    {(cByDate[dateStr(dt)] ?? []).filter((c) => toHour(c.time) === h).map((c, ci) => (
                      <div key={c.id}
                        className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-[9px] font-semibold overflow-hidden cursor-pointer hover:brightness-95 transition-all z-10"
                        style={{ backgroundColor: accentColor, color: "#fff", top: ci * 20 + 2, zIndex: 10 + ci }}>
                        <div className="truncate">{c.time} {c.customer}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 日ビュー ─────────────────────────────────────────────────────────────────
function DayView({
  cur, setCur, cByDate, accentColor, canEdit,
}: {
  cur: Date; setCur: (d: Date) => void; cByDate: Record<string, typeof CASES>;
  accentColor: string; canEdit: boolean;
}) {
  const y = cur.getFullYear(), m = cur.getMonth(), d = cur.getDate();
  const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const dayCases = (cByDate[ds] ?? []).sort((a, b) => a.time.localeCompare(b.time));
  const dn = ["日","月","火","水","木","金","土"];
  const dow = cur.getDay();
  const isToday = y === 2026 && m === 1 && d === 13;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 liquid-glass">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/60">
        <button onClick={() => setCur(new Date(y, m, d - 1))} className="p-2 rounded-xl hover:bg-white/50 transition-colors">
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-bold",
            isToday ? "text-white" : "text-slate-700 bg-slate-50")}
            style={isToday ? { backgroundColor: accentColor } : undefined}>
            <span className="text-[10px] leading-none opacity-70">{dn[dow]}</span>
            <span className="text-lg leading-tight">{d}</span>
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">{m + 1}月{d}日（{dn[dow]}）</p>
            <p className="text-xs text-slate-400">{dayCases.length}件の予定</p>
          </div>
        </div>
        <button onClick={() => setCur(new Date(y, m, d + 1))} className="p-2 rounded-xl hover:bg-white/50 transition-colors">
          <ChevronRight size={18} className="text-slate-500" />
        </button>
      </div>

      <div className="relative overflow-y-auto" style={{ height: 560 }}>
        {TIME_SLOTS.map((h) => {
          const slotCases = dayCases.filter((c) => parseInt(c.time.split(":")[0] ?? "9", 10) === h);
          return (
            <div key={h} className="flex border-b border-white/40" style={{ minHeight: 60 }}>
              <div className="w-14 flex items-start justify-end pr-3 pt-2 shrink-0">
                <span className="text-xs text-slate-400">{h}:00</span>
              </div>
              <div className="flex-1 py-1 pr-2 space-y-1 border-l border-white/40">
                {slotCases.map((c) => (
                  <div key={c.id}
                    className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:brightness-95 transition-all"
                    style={{ backgroundColor: accentColor + "18", borderLeft: `3px solid ${accentColor}` }}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">{c.customer}</span>
                        <Badge className={STATUS_MAP[c.status].className}>{STATUS_MAP[c.status].label}</Badge>
                        {c.urgent && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">▲ 緊急</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <Clock size={10} />{c.time}
                        <span>{c.category.label}</span>
                        <span className="flex items-center gap-0.5"><MapPin size={10} />{c.pref}</span>
                        <span>{c.staff}</span>
                        {c.amount > 0 && <span className="font-semibold text-slate-600">{fmt(c.amount)}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  // デフォルトで最初のグループを選択
  const [activeGroup, setActiveGroup] = useState<CalendarGroup | null>(CALENDAR_GROUPS[0] ?? null);
  const [cur, setCur] = useState(new Date(2026, 1, 13));
  const [selDay, setSelDay] = useState(13);
  const [calMode, setCalMode] = useState<CalMode>("month");
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const { setActiveGroup: setHeaderGroup } = useCalendarHeader();

  // ヘッダーにアクティブグループを同期
  useEffect(() => {
    setHeaderGroup(activeGroup);
    return () => setHeaderGroup(null);
  }, [activeGroup, setHeaderGroup]);

  const y = cur.getFullYear(), m = cur.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const fd = new Date(y, m, 1).getDay();
  const startOffset = (fd + 6) % 7;
  const ms = `${y}-${String(m + 1).padStart(2, "0")}`;

  // グループに応じて案件をフィルタリング
  const filteredCases = useMemo(() => {
    if (!activeGroup) return CASES;
    const f = activeGroup.caseFilter;
    return CASES.filter((c) => {
      if (f.prefs?.length && !f.prefs.includes(c.pref)) return false;
      if (f.centers?.length && !f.centers.includes(c.center)) return false;
      if (f.staffIds?.length && !f.staffIds.includes(c.staff)) return false;
      return true;
    });
  }, [activeGroup]);

  const cByDate = useMemo(() => {
    const map: Record<string, typeof CASES> = {};
    filteredCases.forEach((c) => {
      if (!map[c.date]) map[c.date] = [];
      map[c.date].push(c);
    });
    return map;
  }, [filteredCases]);

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= dim; i++) days.push(i);
  while (days.length % 7 !== 0) days.push(null);
  const weeks = Math.ceil(days.length / 7);

  const mn = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const dn = ["月","火","水","木","金","土","日"];
  const isToday = (d: number) => d === 13 && m === 1 && y === 2026;
  const selDateStr = `${ms}-${String(selDay).padStart(2, "0")}`;
  const selCases = (cByDate[selDateStr] || []).sort((a, b) => a.time.localeCompare(b.time));
  const getDow = (d: number) => (new Date(y, m, d).getDay() + 6) % 7;

  const accentColor = activeGroup?.color ?? "#14b8a6";
  const canEdit = activeGroup?.myRole === "owner" || activeGroup?.myRole === "editor";

  // モバイル用：選択日の横スクロール日付
  const mobileMonthDays = useMemo(() => {
    return Array.from({ length: dim }, (_, i) => {
      const d = i + 1;
      const dateStr = `${ms}-${String(d).padStart(2, "0")}`;
      const dow = new Date(y, m, d).getDay();
      return { date: d, dateStr, dow, cases: cByDate[dateStr] || [] };
    });
  }, [dim, ms, m, y, cByDate]);

  return (
    <>
      {/* ===== モバイル ===== */}
      <div className="lg:hidden -mx-4 -mt-4 flex flex-col h-[calc(100vh-56px-64px)]">

        {/* カレンダー画面 */}
        <>
            {/* ── アプリヘッダー ── */}
            <div className="text-white px-4 py-3.5 flex items-center justify-between shrink-0" style={{ backgroundColor: accentColor }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-[15px] font-bold truncate max-w-[240px]">{activeGroup?.name}</span>
                    <button
                      onClick={() => setGroupPickerOpen(true)}
                      className="flex items-center gap-0.5 bg-white/20 rounded-lg px-1.5 py-0.5 active:bg-white/30 shrink-0"
                    >
                      <ChevronDown size={12} className="opacity-90" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[12px] opacity-75 leading-tight mt-1">
                    {activeGroup && ROLE_ICON[activeGroup.myRole]}
                    <span>{activeGroup?.area}エリア · {filteredCases.length}件</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* ビュー切り替え（モバイル） */}
                <div className="flex gap-0.5 bg-white/20 rounded-lg p-0.5">
                  {([["month","月"],["week","週"],["day","日"]] as [CalMode,string][]).map(([k,l]) => (
                    <button key={k} onClick={() => setCalMode(k)}
                      className={cn("px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all",
                        calMode === k ? "bg-white text-indigo-700" : "text-white/80 hover:text-white"
                      )}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 月ナビ + 曜日ヘッダー（固定） ── */}
            <div className="bg-white/70 backdrop-blur-xl shrink-0">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/60">
                <button onClick={() => {
                  if (calMode === "month") setCur(new Date(y, m - 1, 1));
                  else if (calMode === "week") setCur(new Date(cur.getTime() - 7 * 86400000));
                  else setCur(new Date(cur.getTime() - 86400000));
                }} className="p-1 rounded-lg active:bg-slate-100">
                  <ChevronLeft size={17} className="text-slate-500" />
                </button>
                <span className="text-[13px] font-semibold text-slate-700">
                  {calMode === "month" ? `${y}年${mn[m]}`
                    : calMode === "week" ? `${y}年${mn[m]} 第${Math.ceil(selDay / 7)}週`
                    : `${m + 1}月${selDay}日（${dn[getDow(selDay)]}）`}
                </span>
                <button onClick={() => {
                  if (calMode === "month") setCur(new Date(y, m + 1, 1));
                  else if (calMode === "week") setCur(new Date(cur.getTime() + 7 * 86400000));
                  else setCur(new Date(cur.getTime() + 86400000));
                }} className="p-1 rounded-lg active:bg-slate-100">
                  <ChevronRight size={17} className="text-slate-500" />
                </button>
              </div>
              {calMode === "month" && (
              <div className="grid grid-cols-7 border-b border-slate-100">
                {dn.map((d, i) => (
                  <div key={d} className={cn(
                    "py-1 text-center text-[11px] font-semibold",
                    i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-slate-500"
                  )}>{d}</div>
                ))}
              </div>
              )}
            </div>

            {/* ── カレンダーグリッド + 予定リスト（スクロール） ── */}
            <div className="flex-1 overflow-y-auto bg-white/60 backdrop-blur-sm">
              {/* 月ビュー */}
              {calMode === "month" && (
              <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${weeks}, 1fr)`, height: `${weeks * 72}px` }}>
                {days.map((d, i) => {
                  const ds = d ? `${ms}-${String(d).padStart(2, "0")}` : null;
                  const dc = ds ? (cByDate[ds] || []) : [];
                  const isSelected = d === selDay;
                  const today = !!d && isToday(d);
                  const dow = d ? getDow(d) : i % 7;
                  const isSun = dow === 6, isSat = dow === 5;
                  const isLastWeek = Math.floor(i / 7) === weeks - 1;

                  return (
                    <button
                      key={i}
                      onClick={() => d && setSelDay(d)}
                      className={cn(
                        "flex flex-col p-0 border-b border-r border-slate-100 text-left overflow-hidden",
                        !d && "bg-slate-50/40",
                        isSelected && "bg-opacity-10",
                        isLastWeek && "border-b-0",
                        isSun && "border-r-0",
                        !!d && "active:bg-slate-50/60"
                      )}
                      style={isSelected ? { backgroundColor: accentColor + "18" } : undefined}
                    >
                      {d && (
                        <div className="flex flex-col w-full">
                          <div className="flex justify-center pt-1 pb-0.5">
                            <span
                              className={cn(
                                "w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-bold leading-none",
                                isSat ? "text-blue-500" : isSun ? "text-red-500" : "text-slate-700"
                              )}
                              style={
                                today ? { backgroundColor: accentColor, color: "#fff" } :
                                isSelected ? { backgroundColor: accentColor + "33", color: accentColor } :
                                undefined
                              }
                            >
                              {d}
                            </span>
                          </div>
                          {dc.length > 0 && (
                            <div className="flex flex-col gap-[2px] px-[2px] pb-1 w-full overflow-hidden">
                              {dc.slice(0, 2).map((c) => {
                                const s = ST[c.status];
                                const lastName = c.customer.split(" ")[1] ?? c.customer.split(" ")[0];
                                return (
                                  <div
                                    key={c.id}
                                    className="flex items-center w-full rounded-[2px] px-[3px] py-[1.5px] gap-[2px] overflow-hidden"
                                    style={{ backgroundColor: s.bg }}
                                  >
                                    {c.urgent && <span className="text-white text-[7px] font-black leading-none shrink-0">▲</span>}
                                    <span className="text-[8px] font-semibold leading-tight truncate" style={{ color: s.fg }}>
                                      {lastName}
                                    </span>
                                  </div>
                                );
                              })}
                              {dc.length > 2 && (
                                <span className="text-[8px] text-slate-400 px-[3px] leading-none">+{dc.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              )} {/* end month grid */}

              {/* 週ビュー（モバイル） */}
              {calMode === "week" && (
                <div>
                  {/* 横スクロール日付ピル */}
                  <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-b border-slate-100 scrollbar-hide">
                    {mobileMonthDays.map(({ date, dateStr, dow, cases: dc }) => {
                      const isSel = date === selDay;
                      const isT = isToday(date);
                      return (
                        <button key={date} onClick={() => setSelDay(date)}
                          className={cn("flex flex-col items-center rounded-2xl px-2.5 py-2 transition-colors shrink-0 min-w-[44px]",
                            isSel ? "text-white" : isT ? "bg-indigo-50" : "bg-white border border-slate-100"
                          )}
                          style={isSel ? { backgroundColor: accentColor } : undefined}>
                          <span className={cn("text-[10px] font-medium", isSel ? "text-white/80" : dow === 0 ? "text-red-400" : dow === 6 ? "text-blue-400" : "text-slate-400")}>
                            {dn[dow]}
                          </span>
                          <span className={cn("text-base font-bold mt-0.5", isSel ? "text-white" : isT ? "text-indigo-700" : dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-slate-700")}>
                            {date}
                          </span>
                          <div className="flex gap-0.5 mt-1 h-1">
                            {dc.slice(0, 3).map((c, j) => (
                              <div key={j} className="w-1 h-1 rounded-full" style={{ background: isSel ? "rgba(255,255,255,0.6)" : ST[c.status]?.bg ?? "#94a3b8" }} />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* 選択日の予定 */}
                  <div className="border-t-[3px]" style={{ borderColor: accentColor }}>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white/50 backdrop-blur-sm border-b border-white/60">
                      <span className="text-sm font-bold text-slate-800">{m + 1}月{selDay}日の予定 <span className="text-xs font-normal text-slate-500">{selCases.length}件</span></span>
                      <div className="flex items-center gap-2">
                        {selCases.length > 0 && (
                          <button
                            onClick={() => setMapOpen(true)}
                            className="flex items-center gap-1.5 h-8 px-2.5 rounded-full text-xs font-semibold border transition-all active:opacity-80"
                            style={{ color: accentColor, borderColor: accentColor + "40", backgroundColor: accentColor + "12" }}
                          >
                            <Map size={13} />
                            マップ
                          </button>
                        )}
                        {canEdit && <button className="w-8 h-8 rounded-full flex items-center justify-center shadow" style={{ backgroundColor: accentColor }}><Plus size={16} className="text-white" /></button>}
                      </div>
                    </div>
                    {selCases.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {selCases.map((c) => {
                          const s = ST[c.status];
                          return (
                            <div key={c.id} className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 cursor-pointer"
                              onClick={() => setSelectedCase(c)}
                              style={{ borderLeft: `3px solid ${s.bg}` }}>
                              <div className="w-10 text-center shrink-0"><p className="text-xs font-bold" style={{ color: s.bg }}>{c.time || "--"}</p></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-sm font-semibold text-slate-800 truncate">{c.customer}</span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: s.bg + "22", color: s.bg }}>{STATUS_MAP[c.status].label}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{c.category.label} · {c.staff}</p>
                              </div>
                              {c.amount > 0 && <span className="text-xs font-semibold text-slate-600 shrink-0">{fmt(c.amount)}</span>}
                              <ChevronRight size={14} className="text-slate-300 shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-sm text-slate-400"><Bell size={24} className="mx-auto mb-1.5 opacity-25" />この日の予定はありません</div>
                    )}
                  </div>
                </div>
              )}

              {/* 日ビュー（モバイル） */}
              {calMode === "day" && (
                <div>
                  {/* 横スクロール日付ピル（1週間） */}
                  <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-b border-slate-100 scrollbar-hide">
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = selDay - 3 + i;
                      const clamped = Math.max(1, Math.min(date, dim));
                      const dateStr = `${ms}-${String(clamped).padStart(2, "0")}`;
                      const dow = new Date(y, m, clamped).getDay();
                      const dc = cByDate[dateStr] || [];
                      const isSel = clamped === selDay;
                      const isT = isToday(clamped);
                      return (
                        <button key={i} onClick={() => setSelDay(clamped)}
                          className={cn("flex flex-col items-center rounded-2xl px-2.5 py-2 shrink-0 min-w-[44px] transition-colors",
                            isSel ? "text-white" : isT ? "bg-indigo-50" : "bg-white border border-slate-100"
                          )}
                          style={isSel ? { backgroundColor: accentColor } : undefined}>
                          <span className={cn("text-[10px] font-medium", isSel ? "text-white/80" : dow === 0 ? "text-red-400" : dow === 6 ? "text-blue-400" : "text-slate-400")}>{dn[dow]}</span>
                          <span className={cn("text-base font-bold mt-0.5", isSel ? "text-white" : isT ? "text-indigo-700" : dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-slate-700")}>{clamped}</span>
                          <div className="flex gap-0.5 mt-1 h-1">
                            {dc.slice(0, 3).map((c, j) => <div key={j} className="w-1 h-1 rounded-full" style={{ background: isSel ? "rgba(255,255,255,0.6)" : ST[c.status]?.bg ?? "#94a3b8" }} />)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* タイムライン */}
                  <div className="px-4 pt-3 space-y-2 pb-4">
                    {selCases.length === 0 ? (
                      <div className="py-10 text-center text-sm text-slate-400"><Bell size={24} className="mx-auto mb-1.5 opacity-25" />この日の予定はありません</div>
                    ) : selCases.map((c) => {
                      const s = ST[c.status];
                      return (
                        <div key={c.id} className="flex items-center gap-3 p-3.5 rounded-2xl active:scale-[0.98] transition-transform cursor-pointer"
                          onClick={() => setSelectedCase(c)}
                          style={{ background: s.bg + "10", border: `1px solid ${s.bg}25` }}>
                          <div className="text-center shrink-0 w-12">
                            <div className="text-sm font-bold" style={{ color: s.bg }}>{c.time || "--"}</div>
                          </div>
                          <div className="w-0.5 h-10 rounded-full shrink-0" style={{ background: s.bg }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-semibold text-slate-800">{c.customer}</span>
                              {c.urgent && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">▲ 緊急</span>}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{c.category.label} · {c.staff}</p>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 月ビュー時の選択日予定リスト */}
              {calMode === "month" && (
                <div className="border-t-[3px]" style={{ borderColor: accentColor }}>
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/50 backdrop-blur-sm border-b border-white/60">
                  <span className="text-sm font-bold text-slate-800">
                    {m + 1}月{selDay}日の予定
                    {selCases.length > 0 && (
                      <span className="ml-1.5 text-xs font-normal text-slate-500">{selCases.length}件</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {selCases.length > 0 && (
                      <button
                        onClick={() => setMapOpen(true)}
                        className="flex items-center gap-1.5 h-8 px-2.5 rounded-full text-xs font-semibold border transition-all active:opacity-80"
                        style={{ color: accentColor, borderColor: accentColor + "40", backgroundColor: accentColor + "12" }}
                      >
                        <Map size={13} />
                        マップ
                      </button>
                    )}
                    {canEdit && (
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow active:opacity-80 transition-opacity"
                        style={{ backgroundColor: accentColor }}
                      >
                        <Plus size={16} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {selCases.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {selCases.map((c) => {
                      const s = ST[c.status];
                      return (
                        <div key={c.id} className="flex items-stretch active:bg-slate-50 cursor-pointer" onClick={() => setSelectedCase(c)}>
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
              )} {/* end calMode === "month" */}
            </div>
          </>
      </div>

      {/* ===== デスクトップ ===== */}
      <div className="hidden lg:block animate-fade-in">
        {/* カレンダー本体 */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {activeGroup ? activeGroup.name : "カレンダー"}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {activeGroup ? `${activeGroup.area}エリア · ${filteredCases.length}件` : "カレンダーを選択してください"}
                </p>
              </div>
              {/* グループ切り替えドロップダウン */}
              <div className="flex gap-1 flex-wrap ml-2">
                {CALENDAR_GROUPS.filter(g => g.myRole !== "none").map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                      activeGroup?.id === g.id
                        ? "text-white border-transparent shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}
                    style={activeGroup?.id === g.id ? { backgroundColor: g.color, borderColor: g.color } : undefined}
                  >
                    <span>{g.coverEmoji}</span>
                    <span className="hidden xl:inline truncate max-w-[100px]">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* ビュー切替 */}
              <div className="flex gap-1 liquid-glass rounded-xl p-1 border border-white/60 shadow-sm">
                {([
                  ["month", "月", Calendar],
                  ["week",  "週", CalendarDays],
                  ["day",   "日", Clock],
                ] as [CalMode, string, React.ElementType][]).map(([k, l, Icon]) => (
                  <button key={k} onClick={() => setCalMode(k)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      calMode === k ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}>
                    <Icon size={14} />{l}
                  </button>
                ))}
              </div>
              {canEdit && (
                <button
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: accentColor }}
                >
                  <Plus size={16} /> 予定追加
                </button>
              )}
            </div>
          </div>

          {/* 月ビュー */}
          {calMode === "month" && (
            <>
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
                  {["日","月","火","水","木","金","土"].map((d, i) => (
                    <div key={d} className={cn("py-2 text-center text-xs font-semibold",
                      i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400")}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-white/40 rounded-xl overflow-hidden border border-white/60">
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
                          className={cn("min-h-[90px] bg-white/60 backdrop-blur-sm p-1.5 hover:bg-white/80 cursor-pointer transition-colors", !d && "bg-white/20")}
                          onClick={() => d && setSelDay(d)}>
                          {d && (
                            <>
                              <div className={cn("w-7 h-7 flex items-center justify-center rounded-lg text-sm font-medium mb-1",
                                isToday(d) ? "text-white" : dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-slate-700")}
                                style={isToday(d) ? { backgroundColor: accentColor } : undefined}>
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
                      <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl liquid-glass hover:shadow-sm transition-shadow border border-white/60">
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
                  <div className="py-8 text-center text-sm text-slate-400">
                    {activeGroup ? "この日の予定はありません" : "カレンダーを選択してください"}
                  </div>
                )}
              </Card>
            </>
          )}

          {/* 週ビュー */}
          {calMode === "week" && (
            <WeekView cur={cur} setCur={setCur} cByDate={cByDate} accentColor={accentColor} canEdit={canEdit} ms={ms} />
          )}

          {/* 日ビュー */}
          {calMode === "day" && (
            <DayView cur={cur} setCur={setCur} cByDate={cByDate} accentColor={accentColor} canEdit={canEdit} />
          )}
        </div>
      </div>

      {/* グループ選択モーダル（モバイル） */}
      <CalendarGroupPickerModal
        open={groupPickerOpen}
        onClose={() => setGroupPickerOpen(false)}
        currentGroupId={activeGroup?.id ?? null}
        onSelect={(g) => setActiveGroup(g)}
      />

      {/* 案件詳細モーダル */}
      {selectedCase && (
        <QuickCaseModal c={selectedCase} onClose={() => setSelectedCase(null)} />
      )}

      {/* 日付マップモーダル */}
      {mapOpen && (
        <DayMapModal
          date={selDateStr}
          displayDate={`${m + 1}月${selDay}日（${dn[getDow(selDay)]}）`}
          cases={selCases}
          accentColor={accentColor}
          onClose={() => setMapOpen(false)}
          onSelectCase={(c) => {
            setSelectedCase(c);
            setMapOpen(false);
          }}
        />
      )}
    </>
  );
}
