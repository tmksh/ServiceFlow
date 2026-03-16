"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { Logo, LogoIcon } from "@/components/ui/logo";
import {
  LayoutGrid, Inbox, FileText, Calendar, Calculator, BarChart3,
  Globe, ClipboardList, ChevronDown, Folder,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutGrid, Inbox, FileText, Calendar, Calculator, BarChart3,
  Globe, ClipboardList, Folder,
};

// ナビゲーションのグループ定義
const NAV_GROUPS = [
  {
    label: "業務",
    ids: ["dashboard", "line", "cases", "calendar", "docs"],
  },
];

interface SidebarProps {
  open: boolean;
}

export function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "hidden lg:flex flex-col h-full transition-all duration-300 shrink-0",
      "bg-white/60 backdrop-blur-2xl border-r border-white/60",
      "shadow-[1px_0_0_0_rgba(255,255,255,0.5)_inset]",
      open ? "w-44" : "w-[72px]"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 border-b border-slate-100 shrink-0",
        open ? "px-5" : "px-3 justify-center"
      )}>
        {open ? (
          <Logo variant="full" theme="auto" size="sm" />
        ) : (
          <LogoIcon size={32} />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto flex flex-col">
        {NAV_GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((item) => group.ids.includes(item.id));
          return (
            <div key={group.label} className="mb-2">
              {open && (
                <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest px-3 mb-1 mt-1">
                  {group.label}
                </p>
              )}
              {!open && <div className="my-2 mx-1 h-px bg-slate-100" />}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = iconMap[item.icon];

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 w-full rounded-xl transition-all duration-200",
                        open ? "px-3 py-2.5" : "p-2.5 justify-center",
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      )}
                    >
                      <div className="relative shrink-0">
                        {Icon && <Icon size={20} className={active ? "text-indigo-600" : ""} />}
                        {item.badge && item.badge > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {open && <span className="text-sm font-medium truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* 設定リンク */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 w-full rounded-xl transition-all duration-200",
              open ? "px-3 py-2.5" : "p-2.5 justify-center",
              pathname === "/settings"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <div className="relative shrink-0">
              <ClipboardList size={20} className={pathname === "/settings" ? "text-indigo-600" : ""} />
            </div>
            {open && <span className="text-sm font-medium truncate">設定</span>}
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className={cn("border-t border-slate-100 p-3 shrink-0", !open && "flex justify-center")}>
        {open ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              加
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">加藤</p>
              <p className="text-[10px] text-slate-400">管理者</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            加
          </div>
        )}
      </div>
    </aside>
  );
}
