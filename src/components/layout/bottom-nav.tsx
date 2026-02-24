"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid, Inbox, FileText, Calendar, MoreHorizontal,
  Calculator, BarChart3, Globe, ClipboardList, Settings, X,
} from "lucide-react";

const PRIMARY_TABS = [
  { id: "dashboard", label: "ホーム", icon: LayoutGrid, href: "/" },
  { id: "line", label: "LINE", icon: Inbox, href: "/line", badge: 3 },
  { id: "cases", label: "案件", icon: FileText, href: "/cases" },
  { id: "calendar", label: "予定", icon: Calendar, href: "/calendar" },
  { id: "more", label: "その他", icon: MoreHorizontal, href: "" },
];

const MORE_ITEMS = [
  { id: "settlement", label: "日報・精算", icon: Calculator, href: "/settlement" },
  { id: "analytics", label: "売上分析", icon: BarChart3, href: "/analytics" },
  { id: "ads", label: "広告・LP管理", icon: Globe, href: "/ads" },
  { id: "reports", label: "レポート", icon: ClipboardList, href: "/reports" },
  { id: "settings", label: "設定", icon: Settings, href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_ITEMS.some((item) => pathname === item.href);

  return (
    <>
      {/* More menu overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-sheet-up pb-safe-bottom">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="font-bold text-slate-800">その他のメニュー</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1 px-3 pb-4">
              {MORE_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95",
                      active
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-500 hover:bg-slate-50 active:bg-slate-100"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      active ? "bg-indigo-100" : "bg-slate-100"
                    )}>
                      <item.icon size={22} />
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/60 lg:hidden pb-safe-bottom">
        <div className="flex items-stretch">
          {PRIMARY_TABS.map((tab) => {
            const isMore = tab.id === "more";
            const active = isMore
              ? isMoreActive
              : tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isMore) {
                    setMoreOpen(!moreOpen);
                  } else {
                    setMoreOpen(false);
                    router.push(tab.href);
                  }
                }}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 pt-2.5 relative transition-colors min-h-[56px]",
                  active ? "text-indigo-600" : "text-slate-400 active:text-slate-600"
                )}
              >
                {/* Active indicator dot */}
                {active && (
                  <div className="absolute top-1 w-5 h-0.5 bg-indigo-600 rounded-full nav-indicator" />
                )}
                <div className="relative">
                  <tab.icon size={22} strokeWidth={active ? 2.5 : 2} />
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] leading-tight",
                  active ? "font-bold" : "font-medium"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
