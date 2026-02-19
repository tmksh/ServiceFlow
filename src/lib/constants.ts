import type { Category, StatusDef, CaseStatus, NavItem } from "@/types";

export const CATEGORIES: Category[] = [
  { id: "fuyouhin", label: "不用品回収", color: "#6366f1", icon: "Package" },
  { id: "hikkoshi", label: "引っ越し", color: "#8b5cf6", icon: "Truck" },
  { id: "cleaning", label: "ハウスクリーニング", color: "#06b6d4", icon: "Home" },
  { id: "suidou", label: "水道修理", color: "#3b82f6", icon: "Droplet" },
  { id: "kagi", label: "鍵トラブル", color: "#f59e0b", icon: "KeyRound" },
  { id: "repair", label: "修理・メンテナンス", color: "#10b981", icon: "Wrench" },
];

export const STATUS_MAP: Record<CaseStatus, StatusDef> = {
  new: { label: "新規", className: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  estimate: { label: "見積", className: "bg-violet-50 text-violet-700 border border-violet-200" },
  confirmed: { label: "確定", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  inProgress: { label: "対応中", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  completed: { label: "完了", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  cancelled: { label: "キャンセル", className: "bg-red-50 text-red-700 border border-red-200" },
};

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "ダッシュボード", icon: "LayoutGrid", href: "/" },
  { id: "line", label: "LINE受信", icon: "Inbox", href: "/line", badge: 3 },
  { id: "cases", label: "案件管理", icon: "FileText", href: "/cases" },
  { id: "calendar", label: "スケジュール", icon: "Calendar", href: "/calendar" },
  { id: "settlement", label: "日報・精算", icon: "Calculator", href: "/settlement" },
  { id: "analytics", label: "売上分析", icon: "BarChart3", href: "/analytics" },
  { id: "ads", label: "広告・LP管理", icon: "Globe", href: "/ads" },
  { id: "reports", label: "レポート", icon: "ClipboardList", href: "/reports" },
];

export const NAV_UTIL: NavItem[] = [
  { id: "settings", label: "設定", icon: "Settings", href: "/settings" },
];
