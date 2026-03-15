"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { Logo } from "@/components/ui/logo";
import {
  LayoutGrid, Inbox, FileText, Calendar, Calculator, BarChart3,
  Globe, ClipboardList, X, Settings, Folder,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutGrid, Inbox, FileText, Calendar, Calculator, BarChart3,
  Globe, ClipboardList, Folder,
};

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      <aside className="fixed left-0 top-0 z-50 flex flex-col bg-white border-r border-slate-200/60 h-full w-64 lg:hidden animate-slide-in">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 shrink-0">
          <Logo variant="full" theme="auto" size="sm" />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest px-3 mb-2">
            メニュー
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = iconMap[item.icon];

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200",
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
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Settings link */}
        <div className="border-t border-slate-100 p-3 shrink-0">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200",
              pathname === "/settings"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <Settings size={20} className={pathname === "/settings" ? "text-indigo-600" : ""} />
            <span className="text-sm font-medium">設定</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
