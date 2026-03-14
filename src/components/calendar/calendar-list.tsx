"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CALENDAR_GROUPS } from "@/lib/mock-data";
import type { CalendarGroup, CalendarRole } from "@/types";
import { Star, ChevronRight, Plus, Lock, Eye, Edit3, Crown, SlidersHorizontal } from "lucide-react";

interface CalendarListProps {
  onSelect: (group: CalendarGroup) => void;
  selectedId: string | null;
}

const ROLE_BADGE: Record<CalendarRole, { label: string; color: string; icon: React.ReactNode }> = {
  owner:  { label: "オーナー", color: "text-amber-600 bg-amber-50",  icon: <Crown  size={10} /> },
  editor: { label: "編集",     color: "text-blue-600 bg-blue-50",    icon: <Edit3  size={10} /> },
  viewer: { label: "閲覧",     color: "text-slate-500 bg-slate-100", icon: <Eye    size={10} /> },
  none:   { label: "アクセス不可", color: "text-red-500 bg-red-50",  icon: <Lock   size={10} /> },
};

const AREA_FILTERS = ["すべて", "神奈川", "東京", "関西", "関東", "福岡"];

export function CalendarList({ onSelect, selectedId }: CalendarListProps) {
  const [tab, setTab] = useState<"all" | "shared" | "public">("all");
  const [areaFilter, setAreaFilter] = useState("すべて");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = CALENDAR_GROUPS.filter((g) => {
    if (areaFilter !== "すべて" && g.area !== areaFilter) return false;
    return true;
  });

  const pinned = filtered.filter((g) => g.isPinned);
  const rest = filtered.filter((g) => !g.isPinned);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── ヘッダー ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-[17px] font-bold text-slate-900">カレンダーリスト</h2>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-slate-600 active:text-slate-800">
            <Star size={20} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn("active:text-slate-800 transition-colors", showFilters ? "text-teal-600" : "text-slate-400 hover:text-slate-600")}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* ── タブ ── */}
      <div className="flex border-b border-slate-100 px-4">
        {(["all", "shared", "public"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium transition-colors",
              tab === t
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t === "all" ? "すべて" : t === "shared" ? "共有" : "公開"}
          </button>
        ))}
      </div>

      {/* ── エリアフィルター ── */}
      {showFilters && (
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {AREA_FILTERS.map((area) => (
              <button
                key={area}
                onClick={() => setAreaFilter(area)}
                className={cn(
                  "shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  areaFilter === area
                    ? "bg-teal-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-teal-400"
                )}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── リスト ── */}
      <div className="flex-1 overflow-y-auto">
        {/* カウント + ソートボタン */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs text-slate-500 font-medium">カレンダー（{filtered.length}）</span>
          <button className="text-slate-400">
            <SlidersHorizontal size={15} />
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {[...pinned, ...rest].map((group) => (
            <GroupRow
              key={group.id}
              group={group}
              selected={group.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* 新規作成ボタン */}
        <button className="flex items-center gap-3 w-full px-4 py-3.5 text-teal-600 hover:bg-teal-50 active:bg-teal-100 transition-colors mt-1 border-t border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border-2 border-dashed border-teal-300 flex items-center justify-center shrink-0">
            <Plus size={20} className="text-teal-500" />
          </div>
          <span className="text-sm font-medium">新しいカレンダーを作成</span>
        </button>
      </div>
    </div>
  );
}

function GroupRow({
  group,
  selected,
  onSelect,
}: {
  group: CalendarGroup;
  selected: boolean;
  onSelect: (g: CalendarGroup) => void;
}) {
  const role = ROLE_BADGE[group.myRole];
  const canView = group.myRole !== "none";

  return (
    <button
      onClick={() => canView && onSelect(group)}
      disabled={!canView}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 transition-colors text-left",
        selected ? "bg-teal-50" : "hover:bg-slate-50 active:bg-slate-100",
        !canView && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* カバー画像 */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
        style={{ backgroundColor: group.color + "22", border: `2px solid ${group.color}33` }}
      >
        {group.coverEmoji}
      </div>

      {/* テキスト情報 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className={cn("text-[14px] font-semibold leading-snug", selected ? "text-teal-700" : "text-slate-900")}>
            {group.name}
          </span>
          {group.isNew && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500 text-white shrink-0">New</span>
          )}
        </div>

        {/* メンバーアバター */}
        <div className="flex items-center gap-1 flex-wrap">
          {group.members.slice(0, 6).map((m) => (
            <div
              key={m.id + m.name}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: m.color }}
              title={`${m.name}（${ROLE_BADGE[m.role].label}）`}
            >
              {m.avatar}
            </div>
          ))}
          {group.members.length > 6 && (
            <span className="text-[10px] text-slate-400 font-medium">+{group.members.length - 6}</span>
          )}
        </div>
      </div>

      {/* 右側：権限バッジ + 矢印 */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full", role.color)}>
          {role.icon}
          {role.label}
        </span>
        <ChevronRight size={15} className={cn(canView ? "text-slate-400" : "text-slate-200")} />
      </div>
    </button>
  );
}
