"use client";

import { useState, useMemo } from "react";
import { X, MapPin, Clock, ChevronRight, Navigation, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_MAP } from "@/lib/constants";
import type { Case } from "@/types";

// ステータス別カラー
const ST_COLOR: Record<string, string> = {
  new:        "#6366f1",
  estimate:   "#8b5cf6",
  confirmed:  "#3b82f6",
  inProgress: "#f59e0b",
  completed:  "#10b981",
  cancelled:  "#ef4444",
};

// 都道府県ベースのおおよそ座標（モックマップ用）
const PREF_COORDS: Record<string, { x: number; y: number }> = {
  "北海道":   { x: 0.82, y: 0.08 },
  "青森県":   { x: 0.80, y: 0.15 },
  "岩手県":   { x: 0.79, y: 0.19 },
  "宮城県":   { x: 0.78, y: 0.23 },
  "秋田県":   { x: 0.74, y: 0.19 },
  "山形県":   { x: 0.73, y: 0.24 },
  "福島県":   { x: 0.72, y: 0.28 },
  "茨城県":   { x: 0.69, y: 0.33 },
  "栃木県":   { x: 0.66, y: 0.31 },
  "群馬県":   { x: 0.62, y: 0.31 },
  "埼玉県":   { x: 0.63, y: 0.35 },
  "千葉県":   { x: 0.67, y: 0.36 },
  "東京都":   { x: 0.64, y: 0.37 },
  "神奈川県": { x: 0.63, y: 0.39 },
  "新潟県":   { x: 0.61, y: 0.26 },
  "富山県":   { x: 0.55, y: 0.29 },
  "石川県":   { x: 0.51, y: 0.28 },
  "福井県":   { x: 0.50, y: 0.33 },
  "山梨県":   { x: 0.60, y: 0.36 },
  "長野県":   { x: 0.57, y: 0.32 },
  "岐阜県":   { x: 0.52, y: 0.37 },
  "静岡県":   { x: 0.59, y: 0.41 },
  "愛知県":   { x: 0.53, y: 0.41 },
  "三重県":   { x: 0.50, y: 0.44 },
  "滋賀県":   { x: 0.47, y: 0.40 },
  "京都府":   { x: 0.45, y: 0.39 },
  "大阪府":   { x: 0.44, y: 0.43 },
  "兵庫県":   { x: 0.41, y: 0.42 },
  "奈良県":   { x: 0.46, y: 0.44 },
  "和歌山県": { x: 0.44, y: 0.48 },
  "鳥取県":   { x: 0.37, y: 0.36 },
  "島根県":   { x: 0.32, y: 0.37 },
  "岡山県":   { x: 0.37, y: 0.42 },
  "広島県":   { x: 0.33, y: 0.43 },
  "山口県":   { x: 0.27, y: 0.46 },
  "徳島県":   { x: 0.44, y: 0.50 },
  "香川県":   { x: 0.42, y: 0.47 },
  "愛媛県":   { x: 0.37, y: 0.50 },
  "高知県":   { x: 0.40, y: 0.55 },
  "福岡県":   { x: 0.22, y: 0.50 },
  "佐賀県":   { x: 0.20, y: 0.52 },
  "長崎県":   { x: 0.18, y: 0.55 },
  "熊本県":   { x: 0.22, y: 0.56 },
  "大分県":   { x: 0.26, y: 0.53 },
  "宮崎県":   { x: 0.27, y: 0.60 },
  "鹿児島県": { x: 0.23, y: 0.64 },
  "沖縄県":   { x: 0.18, y: 0.82 },
};

// 同一都道府県内でランダムにずらす（シードベース）
function getPinCoords(c: Case, index: number): { x: number; y: number } {
  const base = PREF_COORDS[c.pref] ?? { x: 0.5, y: 0.5 };
  const seed = c.id.charCodeAt(3) + index;
  const jitter = 0.025;
  return {
    x: base.x + ((seed * 37) % 100) / 100 * jitter * 2 - jitter,
    y: base.y + ((seed * 53) % 100) / 100 * jitter * 2 - jitter,
  };
}

// 時間帯グループ（午前/午後/夕方）
type TimeSlot = "morning" | "afternoon" | "evening";
function getTimeSlot(time: string): TimeSlot {
  const h = parseInt(time.split(":")[0] ?? "12", 10);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
const TIME_SLOT_LABEL: Record<TimeSlot, { label: string; emoji: string; color: string }> = {
  morning:   { label: "午前",   emoji: "🌅", color: "#f59e0b" },
  afternoon: { label: "午後",   emoji: "☀️", color: "#3b82f6" },
  evening:   { label: "夕方",   emoji: "🌆", color: "#8b5cf6" },
};

interface DayMapModalProps {
  date: string;       // "YYYY-MM-DD"
  displayDate: string; // "X月Y日（曜）"
  cases: Case[];
  accentColor: string;
  onClose: () => void;
  onSelectCase?: (c: Case) => void;
}

export function DayMapModal({
  date: _date,
  displayDate,
  cases,
  accentColor,
  onClose,
  onSelectCase,
}: DayMapModalProps) {
  const [activeSlot, setActiveSlot] = useState<TimeSlot | "all">("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedCases = useMemo(
    () => [...cases].sort((a, b) => a.time.localeCompare(b.time)),
    [cases]
  );

  const filteredCases = useMemo(() => {
    if (activeSlot === "all") return sortedCases;
    return sortedCases.filter((c) => getTimeSlot(c.time) === activeSlot);
  }, [sortedCases, activeSlot]);

  // 時間帯ごとの件数
  const slotCounts = useMemo(() => {
    const counts: Record<TimeSlot, number> = { morning: 0, afternoon: 0, evening: 0 };
    sortedCases.forEach((c) => counts[getTimeSlot(c.time)]++);
    return counts;
  }, [sortedCases]);

  const selectedCase = selectedId ? sortedCases.find((c) => c.id === selectedId) : null;

  // ピン座標（全案件）
  const pinData = useMemo(
    () => sortedCases.map((c, i) => ({ c, coords: getPinCoords(c, i) })),
    [sortedCases]
  );

  const visiblePinIds = new Set(filteredCases.map((c) => c.id));

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* モーダル本体（ボトムシート） */}
        <div
          className="relative mt-auto w-full rounded-t-3xl overflow-hidden flex flex-col"
          style={{
            maxHeight: "92dvh",
            backgroundColor: "#f8fafc",
            animation: "dayMapSlideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 pb-3 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">{displayDate}の現場マップ</h2>
            <p className="text-xs text-slate-400 mt-0.5">{cases.length}件の予定</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* 時間帯フィルター */}
        <div className="flex gap-2 px-4 pb-3 shrink-0 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveSlot("all")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
              activeSlot === "all"
                ? "text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200"
            )}
            style={activeSlot === "all" ? { backgroundColor: accentColor } : undefined}
          >
            🗺️ 全表示 <span className="opacity-75">({cases.length})</span>
          </button>
          {(["morning", "afternoon", "evening"] as TimeSlot[]).map((slot) => {
            const info = TIME_SLOT_LABEL[slot];
            const count = slotCounts[slot];
            if (count === 0) return null;
            return (
              <button
                key={slot}
                onClick={() => setActiveSlot(slot)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                  activeSlot === slot
                    ? "text-white shadow-sm border-transparent"
                    : "bg-white text-slate-500 border-slate-200"
                )}
                style={activeSlot === slot ? { backgroundColor: info.color } : undefined}
              >
                {info.emoji} {info.label} <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* マップエリア */}
        <div className="relative mx-4 rounded-2xl overflow-hidden shrink-0" style={{ height: 220 }}>
          {/* 背景（地図風グラデーション） */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, #dbeafe 0%, #e0f2fe 30%, #dcfce7 60%, #f0fdf4 100%)",
            }}
          />
          {/* グリッド線（道路風） */}
          <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`}
                stroke="#64748b" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <line key={`v${i}`} x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%"
                stroke="#64748b" strokeWidth="0.5" />
            ))}
            {/* 幹線道路風 */}
            <line x1="0" y1="40%" x2="100%" y2="45%" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="30%" y1="0" x2="35%" y2="100%" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="0" y1="70%" x2="100%" y2="68%" stroke="#94a3b8" strokeWidth="1" />
            <line x1="60%" y1="0" x2="65%" y2="100%" stroke="#94a3b8" strokeWidth="1" />
          </svg>

          {/* 地名ラベル風 */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute text-[9px] text-slate-400 font-medium" style={{ top: "12%", left: "25%" }}>
              {filteredCases[0]?.pref.replace("都", "").replace("道", "").replace("府", "").replace("県", "") ?? ""}
            </span>
          </div>

          {/* ピン */}
          {pinData.map(({ c, coords }) => {
            const isVisible = visiblePinIds.has(c.id);
            const isHovered = hoveredId === c.id;
            const isSelected = selectedId === c.id;
            const color = ST_COLOR[c.status] ?? accentColor;
            const xPct = coords.x * 100;
            const yPct = coords.y * 100;

            return (
              <button
                key={c.id}
                className={cn(
                  "absolute transition-all duration-200 flex flex-col items-center group",
                  !isVisible && "opacity-20 pointer-events-none"
                )}
                style={{
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  transform: "translate(-50%, -100%)",
                  zIndex: isHovered || isSelected ? 20 : 10,
                }}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
              >
                {/* ツールチップ */}
                {(isHovered || isSelected) && (
                  <div
                    className="absolute bottom-full mb-1 whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-semibold text-white shadow-lg pointer-events-none"
                    style={{ backgroundColor: color, marginBottom: 6 }}
                  >
                    {c.time} {c.customer}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                      style={{
                        top: "100%",
                        borderLeft: "4px solid transparent",
                        borderRight: "4px solid transparent",
                        borderTop: `4px solid ${color}`,
                      }}
                    />
                  </div>
                )}
                {/* ピンアイコン */}
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center shadow-md transition-transform",
                    isSelected || isHovered ? "scale-125" : "scale-100"
                  )}
                  style={{
                    width: isSelected ? 28 : 22,
                    height: isSelected ? 28 : 22,
                    backgroundColor: color,
                    border: `2px solid white`,
                  }}
                >
                  {c.urgent ? (
                    <AlertTriangle size={isSelected ? 13 : 10} className="text-white" />
                  ) : (
                    <MapPin size={isSelected ? 13 : 10} className="text-white" />
                  )}
                </div>
                {/* 影の丸 */}
                <div
                  className="w-2 h-0.5 rounded-full opacity-30 mt-0.5"
                  style={{ backgroundColor: color }}
                />
              </button>
            );
          })}

          {/* 案件がない場合 */}
          {filteredCases.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={28} className="mx-auto text-slate-300 mb-1" />
                <p className="text-xs text-slate-400">この時間帯の予定はありません</p>
              </div>
            </div>
          )}

          {/* 右下：凡例 */}
          <div className="absolute right-2 bottom-2 flex flex-col gap-1">
            {(["morning", "afternoon", "evening"] as TimeSlot[]).filter((s) => slotCounts[s] > 0).map((slot) => {
              const info = TIME_SLOT_LABEL[slot];
              return (
                <div key={slot} className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-0.5">
                  <span className="text-[9px]">{info.emoji}</span>
                  <span className="text-[9px] font-medium text-slate-600">{info.label} {slotCounts[slot]}件</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 選択中案件のプレビュー */}
        {selectedCase && (
          <div
            className="mx-4 mt-2 rounded-xl p-3 flex items-center gap-3 shrink-0 transition-all"
            style={{
              backgroundColor: (ST_COLOR[selectedCase.status] ?? accentColor) + "15",
              borderLeft: `3px solid ${ST_COLOR[selectedCase.status] ?? accentColor}`,
            }}
          >
            <div className="w-10 text-center shrink-0">
              <p className="text-xs font-bold" style={{ color: ST_COLOR[selectedCase.status] ?? accentColor }}>
                {selectedCase.time}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800 truncate">{selectedCase.customer}</span>
                {selectedCase.urgent && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 shrink-0">▲ 緊急</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <MapPin size={9} />{selectedCase.addr || selectedCase.pref}
              </p>
            </div>
            {onSelectCase && (
              <button
                onClick={() => { onSelectCase(selectedCase); onClose(); }}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white shrink-0"
                style={{ backgroundColor: ST_COLOR[selectedCase.status] ?? accentColor }}
              >
                詳細 <ChevronRight size={12} />
              </button>
            )}
          </div>
        )}

        {/* タイムラインリスト */}
        <div className="flex-1 overflow-y-auto mt-2 pb-safe">
          <div className="px-4 pb-1 pt-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              タイムライン
            </p>
          </div>

          {(["morning", "afternoon", "evening"] as TimeSlot[]).map((slot) => {
            const slotCases = filteredCases.filter((c) => getTimeSlot(c.time) === slot);
            if (slotCases.length === 0) return null;
            const info = TIME_SLOT_LABEL[slot];
            return (
              <div key={slot}>
                {/* 時間帯ヘッダー */}
                <div className="flex items-center gap-2 px-4 py-1.5">
                  <span className="text-xs">{info.emoji}</span>
                  <span className="text-[11px] font-semibold" style={{ color: info.color }}>
                    {info.label}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: info.color + "40" }} />
                  <span className="text-[10px] text-slate-400">{slotCases.length}件</span>
                </div>

                {/* 案件リスト */}
                <div className="relative px-4">
                  {/* タイムライン縦線 */}
                  <div
                    className="absolute left-8 top-0 bottom-0 w-px"
                    style={{ backgroundColor: info.color + "30" }}
                  />
                  <div className="space-y-1.5 pb-2">
                    {slotCases.map((c) => {
                      const color = ST_COLOR[c.status] ?? accentColor;
                      const isSelected = selectedId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedId(isSelected ? null : c.id)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left",
                            isSelected
                              ? "shadow-sm"
                              : "bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100"
                          )}
                          style={isSelected ? { backgroundColor: color + "12", border: `1px solid ${color}30` } : undefined}
                        >
                          {/* タイムライン点 */}
                          <div className="relative shrink-0">
                            <div
                              className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          </div>

                          {/* 時刻 */}
                          <div className="w-9 text-center shrink-0">
                            <span className="text-xs font-bold" style={{ color }}>{c.time}</span>
                          </div>

                          {/* 縦区切り */}
                          <div className="w-px h-6 rounded-full shrink-0" style={{ backgroundColor: color + "40" }} />

                          {/* 情報 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-slate-800 truncate">{c.customer}</span>
                              <span
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ backgroundColor: color + "20", color }}
                              >
                                {STATUS_MAP[c.status].label}
                              </span>
                              {c.urgent && (
                                <AlertTriangle size={11} className="text-amber-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                              <Navigation size={9} />
                              {c.pref} · {c.staff}
                            </p>
                          </div>

                          <ChevronRight size={13} className="text-slate-300 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCases.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-400">
              <MapPin size={24} className="mx-auto mb-2 opacity-25" />
              この時間帯の予定はありません
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dayMapSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
