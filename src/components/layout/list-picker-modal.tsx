"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LIST_DATA, LIST_MEMBER_COLORS, CALENDAR_GROUPS } from "@/lib/mock-data";
import { STAFF } from "@/lib/constants";
import { X, Plus, Check, ChevronRight, Crown, Edit3, Eye, Lock } from "lucide-react";
import type { CalendarGroup } from "@/types";

const TABS = [
  { id: "all",     label: "すべて" },
  { id: "shared",  label: "共有" },
  { id: "private", label: "非公開" },
] as const;

const ROLE_LABEL: Record<CalendarGroup["myRole"], string> = {
  owner:  "オーナー",
  editor: "編集可",
  viewer: "閲覧のみ",
  none:   "アクセス不可",
};

const ROLE_ICON = {
  owner:  <Crown  size={11} className="text-amber-500" />,
  editor: <Edit3  size={11} className="text-blue-500" />,
  viewer: <Eye    size={11} className="text-slate-400" />,
  none:   <Lock   size={11} className="text-red-400" />,
};

interface ListPickerModalProps {
  open: boolean;
  onClose: () => void;
  currentListId: string;
  onSelect: (id: string) => void;
}

// ─── カレンダーグループ選択モーダル ──────────────────────────────────────────
interface CalendarGroupPickerModalProps {
  open: boolean;
  onClose: () => void;
  currentGroupId: string | null;
  onSelect: (group: CalendarGroup) => void;
}

export function CalendarGroupPickerModal({ open, onClose, currentGroupId, onSelect }: CalendarGroupPickerModalProps) {
  const [tab, setTab] = useState<"all" | "pinned" | "viewer">("all");

  useEffect(() => {
    if (open) setTab("all");
  }, [open]);

  const filtered = CALENDAR_GROUPS.filter((g) => {
    if (g.myRole === "none") return false;
    if (tab === "pinned") return g.isPinned;
    if (tab === "viewer") return g.myRole === "viewer";
    return true;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:w-[420px] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col h-[88vh] sm:h-[560px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 className="text-lg font-bold text-slate-900">カレンダーリスト</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-slate-100 px-5">
          {([
            { id: "all", label: "すべて" },
            { id: "pinned", label: "ピン留め" },
            { id: "viewer", label: "閲覧のみ" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px",
                tab === t.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-400 active:text-slate-600"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* リスト */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-5 pb-1 pt-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              カレンダー（{filtered.length}）
            </p>
          </div>
          {filtered.map((g) => {
            const isActive = currentGroupId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => { onSelect(g); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3.5 px-5 py-3 active:bg-slate-50 transition-colors text-left",
                  isActive && "bg-indigo-50/50"
                )}
              >
                {/* アイコン */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-sm"
                  style={{ background: g.color + "20", border: `1.5px solid ${g.color}40` }}
                >
                  {g.coverEmoji}
                </div>

                {/* テキスト */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-semibold truncate", isActive ? "text-indigo-700" : "text-slate-800")}>
                      {g.name}
                    </p>
                    {isActive && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </span>
                    )}
                    {g.isNew && !isActive && (
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100 shrink-0">NEW</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      {ROLE_ICON[g.myRole]}
                      {ROLE_LABEL[g.myRole]}
                    </span>
                    <span className="text-[11px] text-slate-300">·</span>
                    <span className="text-[11px] text-slate-400">{g.area}エリア</span>
                    <span className="text-[11px] text-slate-300">·</span>
                    <span className="text-[11px] text-slate-400">{g.members.length}人</span>
                  </div>
                  {/* メンバーアバター */}
                  <div className="flex -space-x-1.5 mt-1.5">
                    {g.members.slice(0, 5).map((mem) => (
                      <div
                        key={mem.id}
                        className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ background: mem.color }}
                      >
                        {mem.avatar}
                      </div>
                    ))}
                    {g.members.length > 5 && (
                      <span className="text-[10px] text-slate-400 font-medium pl-2 self-center">+{g.members.length - 5}</span>
                    )}
                  </div>
                </div>

                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="pb-4 shrink-0" />
      </div>
    </div>
  );
}

export function ListPickerModal({ open, onClose, currentListId, onSelect }: ListPickerModalProps) {
  const [tab, setTab] = useState<"all" | "shared" | "private">("all");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (open) { setShowNew(false); setNewName(""); }
  }, [open]);

  const filtered = tab === "all" ? LIST_DATA : LIST_DATA.filter((d) => d.type === tab || d.id === "all");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:w-96 bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル（モバイル） */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 className="text-lg font-bold text-slate-900">カレンダーリスト</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-slate-100 px-5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px",
                tab === t.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* 新規リスト作成 */}
          {showNew ? (
            <div className="mx-4 mb-2 p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-700 mb-2">新規リスト名</p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例: 東北エリア"
                  className="flex-1 px-3 py-2 text-sm bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
                <button
                  onClick={() => setShowNew(false)}
                  className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  作成
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center shrink-0">
                <Plus size={20} className="text-indigo-500" />
              </div>
              <span className="text-sm font-medium text-indigo-600">新規リストを作成</span>
            </button>
          )}

          <div className="px-5 pb-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              リスト（{filtered.length}）
            </p>
          </div>

          {filtered.map((item) => {
            const isActive = currentListId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50 transition-colors text-left",
                  isActive && "bg-indigo-50/50"
                )}
              >
                {/* アイコン */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-sm"
                  style={{ background: item.color + "20", border: `1.5px solid ${item.color}35` }}
                >
                  {item.flag}
                </div>

                {/* テキスト */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-semibold truncate", isActive ? "text-indigo-700" : "text-slate-800")}>
                      {item.label}
                    </p>
                    {isActive && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.desc}</p>
                  {/* メンバーアバター */}
                  {item.members > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex -space-x-1.5">
                        {Array.from({ length: Math.min(item.members, 5) }).map((_, j) => (
                          <div
                            key={j}
                            className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                            style={{ background: LIST_MEMBER_COLORS[j % LIST_MEMBER_COLORS.length] }}
                          >
                            {STAFF[j % STAFF.length][0]}
                          </div>
                        ))}
                      </div>
                      {item.members > 5 && (
                        <span className="text-[10px] text-slate-400 font-medium">+{item.members - 5}</span>
                      )}
                    </div>
                  )}
                </div>

                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="pb-4 shrink-0" />
      </div>
    </div>
  );
}
