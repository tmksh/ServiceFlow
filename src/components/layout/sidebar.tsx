"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import {
  LayoutGrid, Inbox, FileText, Calendar, Calculator, BarChart3,
  Globe, ClipboardList, Layers, ChevronDown,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutGrid, Inbox, FileText, Calendar, Calculator, BarChart3,
  Globe, ClipboardList,
};

interface SidebarProps {
  open: boolean;
}

export function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "hidden lg:flex flex-col bg-white border-r border-slate-200/60 h-full transition-all duration-300 shrink-0",
      open ? "w-64" : "w-[72px]"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 h-16 border-b border-slate-100 shrink-0",
        open ? "px-5" : "px-4 justify-center"
      )}>
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
          <Layers size={20} className="text-white" />
        </div>
        {open && (
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-slate-800 truncate">ServiceFlow</h1>
            <p className="text-[10px] text-slate-400 truncate">顧客管理プラットフォーム</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto flex flex-col">
        {open && (
          <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest px-3 mb-2">
            メニュー
          </p>
        )}
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
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
                <div className="relative">
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
