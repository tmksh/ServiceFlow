"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CALENDAR_GROUPS, LIST_DATA } from "@/lib/mock-data";
import type { CalendarGroup, CalendarMember, CalendarRole } from "@/types";
import {
  Eye, Plus, Trash2, Pencil, Crown, Edit3, Lock,
  ChevronRight, Users, X, Check, GripVertical, Calendar,
  Bell, Building, MessageSquare, Layers, MapPin, Shield,
  Copy, Send, Building2, Activity, Key, Palette, Sun, Moon, Monitor,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

// ─── 定数 ───────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<CalendarRole, { label: string; color: string; icon: React.ReactNode }> = {
  owner:  { label: "オーナー",    color: "text-amber-600 bg-amber-50 border-amber-200",   icon: <Crown  size={11} /> },
  editor: { label: "編集者",      color: "text-blue-600 bg-blue-50 border-blue-200",      icon: <Edit3  size={11} /> },
  viewer: { label: "閲覧者",      color: "text-slate-500 bg-slate-100 border-slate-200",  icon: <Eye    size={11} /> },
  none:   { label: "アクセス不可",color: "text-red-500 bg-red-50 border-red-200",         icon: <Lock   size={11} /> },
};
const ROLE_ORDER: CalendarRole[] = ["owner", "editor", "viewer", "none"];
const AVATAR_COLORS = ["#6366f1","#8b5cf6","#06b6d4","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899","#f97316","#84cc16"];
const LABEL_COLORS = ["#6366f1","#8b5cf6","#06b6d4","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899","#f97316","#84cc16","#64748b","#0ea5e9"];

const ROLES = {
  owner:  { l: "オーナー", color: "bg-violet-100 text-violet-700", canEdit: true,  canDelete: true,  canViewSales: true  },
  admin:  { l: "管理者",   color: "bg-indigo-100 text-indigo-700", canEdit: true,  canDelete: false, canViewSales: true  },
  staff:  { l: "担当者",   color: "bg-emerald-100 text-emerald-700",canEdit: true, canDelete: false, canViewSales: false },
  viewer: { l: "閲覧者",   color: "bg-slate-100 text-slate-600",   canEdit: false, canDelete: false, canViewSales: false },
} as const;

type RoleKey = keyof typeof ROLES;

const MOCK_STAFF = [
  { id: "s1", name: "田中 一郎",   email: "tanaka@example.com", role: "owner" as RoleKey, area: "関東",   cases: 48, active: true  },
  { id: "s2", name: "佐藤 花子",   email: "sato@example.com",   role: "admin" as RoleKey, area: "関東",   cases: 35, active: true  },
  { id: "s3", name: "鈴木 太郎",   email: "suzuki@example.com", role: "staff" as RoleKey, area: "関西",   cases: 22, active: true  },
  { id: "s4", name: "高橋 美咲",   email: "takahashi@example.com",role: "staff"as RoleKey,area: "関東",   cases: 18, active: true  },
  { id: "s5", name: "渡辺 健司",   email: "watanabe@example.com",role: "viewer"as RoleKey,area: "福岡",   cases: 5,  active: false },
];

const PERM_MATRIX = [
  { label: "ダッシュボード閲覧",       perms: { owner: true,  admin: true,  staff: true,  viewer: true  } },
  { label: "案件一覧・詳細閲覧",       perms: { owner: true,  admin: true,  staff: true,  viewer: true  } },
  { label: "案件新規登録・編集",        perms: { owner: true,  admin: true,  staff: true,  viewer: false } },
  { label: "案件削除",                 perms: { owner: true,  admin: false, staff: false, viewer: false } },
  { label: "カレンダー閲覧",           perms: { owner: true,  admin: true,  staff: true,  viewer: true  } },
  { label: "LINE受信・取込",           perms: { owner: true,  admin: true,  staff: false, viewer: false } },
  { label: "売上レポート閲覧",         perms: { owner: true,  admin: true,  staff: false, viewer: false } },
  { label: "書類管理（請求書等）",      perms: { owner: true,  admin: true,  staff: false, viewer: false } },
  { label: "日報・精算管理",           perms: { owner: true,  admin: true,  staff: true,  viewer: false } },
  { label: "スタッフ管理",             perms: { owner: true,  admin: false, staff: false, viewer: false } },
  { label: "設定変更",                 perms: { owner: true,  admin: false, staff: false, viewer: false } },
  { label: "コールセンターフォーム",    perms: { owner: true,  admin: true,  staff: true,  viewer: false } },
];

// ─── サブナビ ────────────────────────────────────────────────────────────────
const SETTINGS_NAV = [
  { id: "appearance", label: "外観",         icon: Palette  },
  { id: "labels",     label: "ラベル管理",   icon: Layers   },
  { id: "lists",      label: "リスト管理",   icon: Calendar },
  { id: "staff",      label: "従業員管理",   icon: Users    },
  { id: "roles",      label: "権限管理",     icon: Shield   },
  { id: "company",    label: "会社情報",     icon: Building },
] as const;

type SettingsTab = typeof SETTINGS_NAV[number]["id"];

// ─── トグルコンポーネント ────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={cn("relative w-11 h-6 rounded-full transition-colors shrink-0", value ? "bg-indigo-600" : "bg-slate-300")}>
      <div className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", value ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

// ─── メンバー編集パネル ──────────────────────────────────────────────────────
function MemberPanel({ group, onClose, onSave }: {
  group: CalendarGroup; onClose: () => void; onSave: (members: CalendarMember[]) => void;
}) {
  const [members, setMembers] = useState<CalendarMember[]>(group.members);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<CalendarRole>("viewer");

  const addMember = () => {
    const name = newName.trim();
    if (!name) return;
    setMembers((prev) => [...prev, {
      id: `m-${Date.now()}`, name, avatar: name[0],
      color: AVATAR_COLORS[members.length % AVATAR_COLORS.length], role: newRole,
    }]);
    setNewName(""); setNewRole("viewer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: group.color + "22" }}>{group.coverEmoji}</div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{group.name}</h3>
              <p className="text-[11px] text-slate-400">メンバー管理</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 px-2 py-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 group">
              <GripVertical size={13} className="text-slate-300 shrink-0" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: m.color }}>{m.avatar}</div>
              <span className="text-sm font-medium text-slate-800 flex-1 min-w-0 truncate">{m.name}</span>
              <select value={m.role} onChange={(e) => setMembers((p) => p.map((x) => x.id === m.id ? { ...x, role: e.target.value as CalendarRole } : x))}
                className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border cursor-pointer outline-none", ROLE_CONFIG[m.role].color)}>
                {ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
              </select>
              <button onClick={() => setMembers((p) => p.filter((x) => x.id !== m.id))}
                className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500 mb-2">メンバーを追加</p>
          <div className="flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMember()}
              placeholder="スタッフ名"
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-white" />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as CalendarRole)}
              className="text-xs px-2 py-2 rounded-xl border border-slate-200 outline-none focus:border-teal-400 bg-white cursor-pointer">
              {ROLE_ORDER.filter((r) => r !== "none").map((r) => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
            </select>
            <button onClick={addMember} disabled={!newName.trim()}
              className="w-9 h-9 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 text-white flex items-center justify-center transition-colors shrink-0">
              <Plus size={15} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">キャンセル</button>
          <button onClick={() => { onSave(members); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium flex items-center justify-center gap-1.5">
            <Check size={14} />保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ラベル管理タブ ──────────────────────────────────────────────────────────
function LabelsTab() {
  const [labels, setLabels] = useState([
    { id: "1", name: "不用品回収",        color: "#6366f1" },
    { id: "2", name: "引っ越し",          color: "#8b5cf6" },
    { id: "3", name: "ハウスクリーニング", color: "#06b6d4" },
    { id: "4", name: "水道修理",          color: "#3b82f6" },
    { id: "5", name: "鍵トラブル",        color: "#f59e0b" },
    { id: "6", name: "修理・メンテ",      color: "#10b981" },
    { id: "7", name: "緊急対応",          color: "#ef4444" },
    { id: "8", name: "VIP顧客",           color: "#ec4899" },
  ]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-slate-100 rounded-xl"><Layers size={18} className="text-slate-600" /></div>
        <div>
          <h3 className="font-bold text-slate-800">ラベル管理</h3>
          <p className="text-xs text-slate-400">スケジュール・案件の色分けラベルを管理</p>
        </div>
      </div>
      <div className="space-y-2 mb-5">
        {labels.map((label) => (
          <div key={label.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group">
            <div className="w-6 h-6 rounded-lg shrink-0" style={{ backgroundColor: label.color }} />
            <span className="text-sm font-medium text-slate-800 flex-1">{label.name}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-lg hover:bg-white transition-colors">
                <Pencil size={13} className="text-slate-400" />
              </button>
              <button onClick={() => setLabels((p) => p.filter((l) => l.id !== label.id))}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={13} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-400 mb-3">ラベルを追加</p>
        <div className="flex gap-2 items-center">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && newName.trim() && (setLabels((p) => [...p, { id: `l-${Date.now()}`, name: newName, color: newColor }]), setNewName(""))}
            placeholder="ラベル名"
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          <div className="flex gap-1.5">
            {LABEL_COLORS.map((c) => (
              <button key={c} onClick={() => setNewColor(c)}
                className={cn("w-6 h-6 rounded-full transition-all hover:scale-110", newColor === c && "ring-2 ring-offset-1 ring-slate-400 scale-110")}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <button onClick={() => { if (newName.trim()) { setLabels((p) => [...p, { id: `l-${Date.now()}`, name: newName, color: newColor }]); setNewName(""); } }}
            disabled={!newName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors">
            追加
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── リスト管理タブ ──────────────────────────────────────────────────────────
function ListsTab() {
  const [groups, setGroups] = useState<CalendarGroup[]>(CALENDAR_GROUPS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [memberEditGroup, setMemberEditGroup] = useState<CalendarGroup | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  return (
    <>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl"><Calendar size={18} className="text-slate-600" /></div>
            <div>
              <h3 className="font-bold text-slate-800">カレンダーリスト管理</h3>
              <p className="text-xs text-slate-400">エリア・拠点ごとのカレンダーリストを管理</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors">
            <Plus size={14} />追加
          </button>
        </div>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 mb-2">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-lg shrink-0">🗂️</div>
          <div className="flex-1"><span className="text-sm font-semibold text-slate-800">すべて（固定）</span></div>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">削除不可</span>
        </div>
        <div className="space-y-1.5">
          {groups.map((g) => (
            <div key={g.id} className={cn("rounded-xl border transition-all", expandedId === g.id ? "border-slate-200 shadow-sm" : "border-transparent hover:border-slate-100")}>
              <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors", expandedId === g.id ? "bg-slate-50" : "hover:bg-slate-50/80")}
                onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: g.color + "22" }}>{g.coverEmoji}</div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 truncate block">{g.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{g.area}エリア</span>
                    <div className="flex -space-x-1">
                      {g.members.slice(0, 4).map((m) => (
                        <div key={m.id} className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[7px] font-bold text-white"
                          style={{ backgroundColor: m.color }}>{m.avatar}</div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{g.members.length}人</span>
                  </div>
                </div>
                <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", ROLE_CONFIG[g.myRole].color)}>
                  {ROLE_CONFIG[g.myRole].icon}{ROLE_CONFIG[g.myRole].label}
                </span>
                <ChevronRight size={14} className={cn("text-slate-400 transition-transform", expandedId === g.id && "rotate-90")} />
              </div>
              {expandedId === g.id && (
                <div className="px-3 pb-3 space-y-3">
                  <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Users size={12} />メンバー（{g.members.length}人）</span>
                      <button onClick={() => setMemberEditGroup(g)} className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
                        <Pencil size={10} />編集
                      </button>
                    </div>
                    {g.members.map((m) => (
                      <div key={m.id} className="flex items-center gap-2.5 px-3 py-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: m.color }}>{m.avatar}</div>
                        <span className="text-sm text-slate-700 flex-1">{m.name}</span>
                        <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", ROLE_CONFIG[m.role].color)}>
                          {ROLE_CONFIG[m.role].icon}{ROLE_CONFIG[m.role].label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Pencil size={11} />リストを編集
                    </button>
                    {deleteConfirmId === g.id ? (
                      <div className="flex gap-1.5 flex-1">
                        <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">キャンセル</button>
                        <button onClick={() => { setGroups((p) => p.filter((x) => x.id !== g.id)); setDeleteConfirmId(null); setExpandedId(null); }}
                          className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-medium">削除する</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(g.id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50">
                        <Trash2 size={11} />削除
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
      {memberEditGroup && (
        <MemberPanel group={memberEditGroup} onClose={() => setMemberEditGroup(null)}
          onSave={(members) => setGroups((p) => p.map((g) => g.id === memberEditGroup.id ? { ...g, members } : g))} />
      )}
    </>
  );
}

// ─── 従業員管理タブ ──────────────────────────────────────────────────────────
function StaffTab() {
  const [staffList, setStaffList] = useState(MOCK_STAFF);
  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <Card glass={false} className="overflow-hidden">
      <div className="flex items-center gap-3 p-5 border-b border-slate-100">
        <div className="p-2.5 bg-slate-100 rounded-xl"><Users size={18} className="text-slate-600" /></div>
        <div>
          <h3 className="font-bold text-slate-800">従業員管理</h3>
          <p className="text-xs text-slate-400">スタッフの招待・権限・アクティブ状態を管理</p>
        </div>
      </div>

      {/* スタッフ一覧 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {["", "名前", "ロール", "担当エリア", "案件数", "状態", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staffList.map((s, i) => {
              const rc = ROLES[s.role];
              const col = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: col }}>
                      {s.name[0]}{s.name.split(" ")[1]?.[0] ?? ""}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold", rc.color)}>{rc.l}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{s.area}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{s.cases}件</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setStaffList((p) => p.map((x) => x.id === s.id ? { ...x, active: !x.active } : x))}
                      className={cn("relative w-10 h-5 rounded-full transition-colors", s.active ? "bg-emerald-500" : "bg-slate-300")}>
                      <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform", s.active ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">編集</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 招待フォーム */}
      <div className="p-5 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">メンバーを招待</p>
        <div className="flex gap-3">
          <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="メールアドレスを入力"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
            <Send size={14} />招待する
          </button>
        </div>
      </div>
    </Card>
  );
}

// ─── 権限管理タブ ────────────────────────────────────────────────────────────
function RolesTab({ currentRole, onRoleChange }: { currentRole: RoleKey; onRoleChange: (r: RoleKey) => void }) {
  return (
    <div className="space-y-5">
      {/* ロールカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.entries(ROLES) as [RoleKey, typeof ROLES[RoleKey]][]).map(([key, r]) => (
          <button key={key} onClick={() => onRoleChange(key)}
            className={cn("bg-white rounded-2xl border-2 p-4 text-left transition-all hover:shadow-sm",
              currentRole === key ? "border-indigo-400 shadow-sm shadow-indigo-100" : "border-slate-100 hover:border-slate-200"
            )}>
            <div className="flex items-start justify-between mb-3">
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", r.color)}>{r.l}</span>
              {currentRole === key && (
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </div>
              )}
            </div>
            <div className="space-y-1.5 text-xs">
              {([["案件編集", r.canEdit], ["削除操作", r.canDelete], ["売上閲覧", r.canViewSales]] as [string, boolean][]).map(([l, v]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className={cn("w-4 h-4 rounded flex items-center justify-center", v ? "bg-emerald-100" : "bg-slate-100")}>
                    {v ? <Check size={9} className="text-emerald-600" /> : <X size={9} className="text-slate-400" />}
                  </div>
                  <span className={v ? "text-slate-700" : "text-slate-400"}>{l}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* 権限マトリクス */}
      <Card glass={false} className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-xl"><Shield size={15} className="text-slate-600" /></div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">権限マトリクス</h3>
            <p className="text-xs text-slate-400">各ロールが利用できる機能の一覧</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 w-48">機能</th>
                {(Object.entries(ROLES) as [RoleKey, typeof ROLES[RoleKey]][]).map(([key, r]) => (
                  <th key={key} className="px-4 py-3 text-center">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", r.color,
                      currentRole === key ? "ring-2 ring-offset-1 ring-indigo-400" : ""
                    )}>{r.l}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERM_MATRIX.map((row, i) => (
                <tr key={i} className={cn("border-b border-slate-50", i % 2 === 0 ? "bg-white" : "bg-slate-50/30")}>
                  <td className="px-5 py-2.5 text-sm text-slate-700">{row.label}</td>
                  {(Object.keys(ROLES) as RoleKey[]).map((key) => (
                    <td key={key} className="px-4 py-2.5 text-center">
                      {row.perms[key] ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                          <Check size={11} className="text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                          <X size={11} className="text-slate-300" />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <Shield size={15} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-900">外注コールセンターへの共有</p>
          <p className="text-xs text-amber-700 mt-1">
            外注コールセンターにはシステムアクセス不要です。受電入力フォームのURLのみを共有してください。フォーム入力後、自動でLINEグループへ通知が届きます。
          </p>
        </div>
      </div>
      <p className="text-xs text-slate-400 px-1">※ デモ用：上のカードをクリックするとロールを切り替えて権限プレビューができます</p>
    </div>
  );
}

// ─── 会社情報タブ ────────────────────────────────────────────────────────────
function CompanyTab() {
  const [toggles, setToggles] = useState({
    autoImport: true, urgentAuto: true,
    notifyNew: true, notifyCancel: true, notifyRemind: true, notifyReport: false,
  });
  const toggle = (k: keyof typeof toggles) => setToggles((t) => ({ ...t, [k]: !t[k] }));

  return (
    <div className="space-y-5">
      {/* 会社情報 */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-slate-100 rounded-xl"><Building2 size={18} className="text-slate-600" /></div>
          <div>
            <h3 className="font-bold text-slate-800">会社情報</h3>
            <p className="text-xs text-slate-400">サービス全体に反映される基本情報</p>
          </div>
        </div>
        {([
          { l: "会社名",       v: "株式会社サンプル",                    icon: Building2  },
          { l: "対応エリア",   v: "関東・東海・関西",                    icon: MapPin     },
          { l: "スタッフ数",   v: "12名",                                icon: Users      },
          { l: "ログイン方式", v: "Google / メール&パスワード",           icon: Key        },
        ] as { l: string; v: string; icon: React.ElementType }[]).map((item) => (
          <div key={item.l} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <item.icon size={13} className="text-slate-500" />
              </div>
              <span className="text-sm text-slate-600">{item.l}</span>
            </div>
            <span className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg">{item.v}</span>
          </div>
        ))}
      </Card>

      {/* 通知設定 */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-amber-50 rounded-xl"><Bell size={18} className="text-amber-600" /></div>
          <div>
            <h3 className="font-bold text-slate-800">通知設定</h3>
            <p className="text-xs text-slate-400">プッシュ通知・メール通知の送信タイミングを管理</p>
          </div>
        </div>
        {([
          { l: "新規案件通知",         k: "notifyNew",    desc: "LINEから案件が届いたとき" },
          { l: "キャンセル通知",       k: "notifyCancel", desc: "顧客からキャンセル連絡があったとき" },
          { l: "当日リマインダー",     k: "notifyRemind", desc: "作業当日の朝8時に担当者へ送信" },
          { l: "日次レポート自動送信", k: "notifyReport", desc: "毎日21時に売上サマリーをメール送信" },
        ] as { l: string; k: keyof typeof toggles; desc: string }[]).map((item) => (
          <div key={item.l} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-medium text-slate-700">{item.l}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            <Toggle value={toggles[item.k]} onChange={() => toggle(item.k)} />
          </div>
        ))}
      </Card>

      {/* LINE連携 */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl" style={{ background: "#e8f7ee" }}>
            <MessageSquare size={18} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">LINE連携</h3>
            <p className="text-xs text-slate-400">LINE Messaging API の案件自動取込設定</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full border border-green-100">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700">接続中</span>
          </div>
        </div>
        {([
          { l: "LINE Messaging APIトークン", v: "lk_*****...abc",                            tp: "secret", desc: "公式チャネルのアクセストークン" },
          { l: "Webhook URL",               v: "https://api.sumakare.jp/webhook/line",        tp: "copy",   desc: "LINE Developersに登録するURL" },
          { l: "メッセージ自動取込",         k: "autoImport",                                 tp: "toggle", desc: "受信メッセージを案件として自動登録" },
          { l: "緊急案件の自動振り分け",     k: "urgentAuto",                                 tp: "toggle", desc: "「急ぎ」等のキーワードで優先度UP" },
        ] as { l: string; v?: string; k?: keyof typeof toggles; tp: string; desc: string }[]).map((item) => (
          <div key={item.l} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-medium text-slate-700">{item.l}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            {item.tp === "toggle" && item.k && (
              <Toggle value={toggles[item.k]} onChange={() => toggle(item.k!)} />
            )}
            {item.tp === "secret" && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg">{item.v}</span>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><Eye size={13} className="text-slate-400" /></button>
              </div>
            )}
            {item.tp === "copy" && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-lg max-w-[180px] truncate">{item.v}</span>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><Copy size={13} className="text-slate-400" /></button>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── メインページ ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("appearance");
  const [currentRole, setCurrentRole] = useState<RoleKey>("owner");
  const { theme, setTheme, resolvedTheme } = useTheme();

  const current = SETTINGS_NAV.find((n) => n.id === tab)!;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
          <current.icon size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{current.label}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {tab === "appearance" ? "テーマ・表示設定をカスタマイズ"
              : tab === "labels" ? "スケジュール・案件の色分けラベルを管理"
              : tab === "lists" ? "エリア・拠点ごとのカレンダーリストを管理"
              : tab === "staff" ? "スタッフの招待・アクティブ状態を管理"
              : tab === "roles" ? "ロール別のアクセス権限を設定"
              : "会社情報・通知設定・LINE連携を管理"}
          </p>
        </div>
      </div>

      {/* サブナビ */}
      <div className="flex gap-1 flex-wrap bg-white rounded-2xl p-1.5 border border-slate-200/60 shadow-sm">
        {SETTINGS_NAV.map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              tab === n.id ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}>
            <n.icon size={14} />{n.label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      {tab === "appearance" && (
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4">テーマ設定</h3>
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: "light",  icon: Sun,     label: "ライト",    desc: "明るい配色" },
                { id: "dark",   icon: Moon,    label: "ダーク",    desc: "暗い配色" },
                { id: "system", icon: Monitor, label: "システム",  desc: "OS設定に従う" },
              ] as { id: "light" | "dark" | "system"; icon: React.ElementType; label: string; desc: string }[]).map(({ id, icon: Icon, label, desc }) => (
                <button key={id} onClick={() => setTheme(id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    theme === id
                      ? "border-indigo-500 bg-indigo-50 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                  )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    theme === id ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                  )}>
                    <Icon size={20} />
                  </div>
                  <div className="text-center">
                    <p className={cn("text-sm font-semibold", theme === id ? "text-indigo-700" : "text-slate-700")}>{label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  {theme === id && (
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", resolvedTheme === "dark" ? "bg-slate-700 text-yellow-400" : "bg-amber-100 text-amber-600")}>
                {resolvedTheme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-700">現在の表示</p>
                <p className="text-xs text-slate-400">{resolvedTheme === "dark" ? "ダークモード" : "ライトモード"}で表示中</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-800 mb-4">表示設定</h3>
            <div className="space-y-3">
              {[
                { label: "アニメーション効果", desc: "画面遷移・フェードインアニメーション", default: true },
                { label: "コンパクト表示", desc: "一覧のリスト間隔を詰めて表示", default: false },
                { label: "通知バッジを表示", desc: "ナビゲーションに未読バッジを表示", default: true },
              ].map((s) => {
                const [val, setVal] = useState(s.default);
                return (
                  <div key={s.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.label}</p>
                      <p className="text-xs text-slate-400">{s.desc}</p>
                    </div>
                    <Toggle value={val} onChange={setVal} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
      {tab === "labels"  && <LabelsTab />}
      {tab === "lists"   && <ListsTab />}
      {tab === "staff"   && <StaffTab />}
      {tab === "roles"   && <RolesTab currentRole={currentRole} onRoleChange={setCurrentRole} />}
      {tab === "company" && <CompanyTab />}
    </div>
  );
}
