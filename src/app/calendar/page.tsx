"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CASES, CALENDAR_GROUPS } from "@/lib/mock-data";
import { STATUS_MAP } from "@/lib/constants";
import { cn, fmt } from "@/lib/utils";
import { CalendarList } from "@/components/calendar/calendar-list";
import type { CalendarGroup } from "@/types";
import {
  Plus, ChevronLeft, ChevronRight, MapPin, Bell,
  ChevronDown, ArrowLeft, Lock, Eye, Edit3, Crown,
} from "lucide-react";

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

export default function CalendarPage() {
  // null = リスト表示、CalendarGroup = そのグループのカレンダー表示
  const [activeGroup, setActiveGroup] = useState<CalendarGroup | null>(null);
  const [cur, setCur] = useState(new Date(2026, 1, 1));
  const [selDay, setSelDay] = useState(13);

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

  return (
    <>
      {/* ===== モバイル ===== */}
      <div className="lg:hidden -mx-4 -mt-4 flex flex-col h-[calc(100vh-56px-64px)]">

        {/* グループ未選択 → リスト画面 */}
        {!activeGroup ? (
          <CalendarList
            onSelect={(g) => setActiveGroup(g)}
            selectedId={null}
          />
        ) : (
          /* グループ選択済み → カレンダー画面 */
          <>
            {/* ── アプリヘッダー ── */}
            <div className="text-white px-4 py-2 flex items-center justify-between shrink-0" style={{ backgroundColor: accentColor }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveGroup(null)}
                  className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 shrink-0"
                >
                  <ArrowLeft size={15} />
                </button>
                <div>
                  <div className="flex items-center gap-1 leading-none">
                    <span className="text-[14px] font-bold truncate max-w-[160px]">{activeGroup.name}</span>
                    <ChevronDown size={12} className="opacity-70 mt-0.5 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] opacity-70 leading-tight mt-0.5">
                    {ROLE_ICON[activeGroup.myRole]}
                    <span>{activeGroup.area}エリア · {filteredCases.length}件</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* メンバーアバター（最大3人） */}
                <div className="flex -space-x-1.5">
                  {activeGroup.members.slice(0, 3).map((mem) => (
                    <div
                      key={mem.id + mem.name}
                      className="w-6 h-6 rounded-full border-2 border-white/60 flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: mem.color }}
                    >
                      {mem.avatar}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 月ナビ + 曜日ヘッダー（固定） ── */}
            <div className="bg-white shrink-0">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
                <button onClick={() => setCur(new Date(y, m - 1, 1))} className="p-1 rounded-lg active:bg-slate-100">
                  <ChevronLeft size={17} className="text-slate-500" />
                </button>
                <span className="text-[13px] font-semibold text-slate-700">{y}年{mn[m]}</span>
                <button onClick={() => setCur(new Date(y, m + 1, 1))} className="p-1 rounded-lg active:bg-slate-100">
                  <ChevronRight size={17} className="text-slate-500" />
                </button>
              </div>
              <div className="grid grid-cols-7 border-b border-slate-100">
                {dn.map((d, i) => (
                  <div key={d} className={cn(
                    "py-1 text-center text-[11px] font-semibold",
                    i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-slate-500"
                  )}>{d}</div>
                ))}
              </div>
            </div>

            {/* ── カレンダーグリッド + 予定リスト（スクロール） ── */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${weeks}, auto)` }}>
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
                        "flex flex-col p-0 border-b border-r border-slate-100 text-left",
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
                                    {c.urgent && <span className="text-white text-[7px] font-black leading-none shrink-0">▲</span>}
                                    <span className="text-[8px] font-semibold leading-tight truncate" style={{ color: s.fg }}>
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
              <div className="border-t-[3px]" style={{ borderColor: accentColor }}>
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-800">
                    {m + 1}月{selDay}日の予定
                    {selCases.length > 0 && (
                      <span className="ml-1.5 text-xs font-normal text-slate-500">{selCases.length}件</span>
                    )}
                  </span>
                  {canEdit && (
                    <button
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow active:opacity-80 transition-opacity"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Plus size={16} className="text-white" />
                    </button>
                  )}
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
          </>
        )}
      </div>

      {/* ===== デスクトップ ===== */}
      <div className="hidden lg:flex gap-6 animate-fade-in">
        {/* 左：カレンダーリスト */}
        <div className="w-72 shrink-0">
          <Card className="p-0 overflow-hidden h-[calc(100vh-96px)] flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-base font-bold text-slate-900">カレンダーリスト</h2>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {[...CALENDAR_GROUPS].map((g) => (
                <button
                  key={g.id}
                  onClick={() => g.myRole !== "none" && setActiveGroup(g)}
                  disabled={g.myRole === "none"}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-4 py-3 text-left transition-colors",
                    activeGroup?.id === g.id ? "bg-teal-50" : "hover:bg-slate-50",
                    g.myRole === "none" && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: g.color + "22" }}
                  >
                    {g.coverEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={cn("text-[13px] font-semibold truncate", activeGroup?.id === g.id ? "text-teal-700" : "text-slate-800")}>
                        {g.name}
                      </span>
                      {g.isNew && <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-teal-500 text-white shrink-0">New</span>}
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {ROLE_ICON[g.myRole]}
                      <span className="text-[10px] text-slate-400">{g.area} · {g.members.length}人</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* 右：カレンダー本体 */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {activeGroup ? activeGroup.name : "スケジュール管理"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {activeGroup ? `${activeGroup.area}エリア · ${filteredCases.length}件` : "カレンダーを選択してください"}
              </p>
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
                      className={cn("min-h-[90px] bg-white p-1.5 hover:bg-slate-50 cursor-pointer", !d && "bg-slate-50/50")}
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
              <div className="py-8 text-center text-sm text-slate-400">
                {activeGroup ? "この日の予定はありません" : "左のリストからカレンダーを選択してください"}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
