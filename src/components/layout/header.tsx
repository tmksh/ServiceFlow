"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { SearchInput } from "@/components/ui/search-input";
import {
  Menu, Settings, Bell, Monitor, Zap, XCircle, CheckCircle,
  Search, X, ArrowLeft,
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const [notOpen, setNotOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Page title mapping for mobile
  const pageTitle = pathname === "/" ? "ホーム"
    : pathname === "/line" ? "LINE受信"
    : pathname === "/cases" ? "案件管理"
    : pathname === "/calendar" ? "スケジュール"
    : pathname === "/settlement" ? "日報・精算"
    : pathname === "/analytics" ? "売上分析"
    : pathname === "/ads" ? "広告・LP管理"
    : pathname === "/reports" ? "レポート"
    : pathname === "/settings" ? "設定" : "";

  // Mobile full-screen search mode
  if (mobileSearchOpen) {
    return (
      <header className="flex items-center h-14 px-3 bg-white border-b border-slate-200/60 shrink-0 lg:hidden animate-fade-in">
        <button
          onClick={() => { setMobileSearchOpen(false); setSearch(""); }}
          className="p-2 rounded-xl active:bg-slate-100 shrink-0"
        >
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div className="flex-1 mx-2">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="案件ID、顧客名で検索..."
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} className="p-2 rounded-xl active:bg-slate-100 shrink-0">
            <X size={18} className="text-slate-400" />
          </button>
        )}
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between h-14 lg:h-16 px-4 lg:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile: page title */}
        <div className="flex items-center gap-3 lg:hidden">
          <h1 className="text-base font-bold text-slate-800">{pageTitle}</h1>
        </div>

        {/* Desktop: sidebar toggle + search */}
        <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 hidden lg:block">
          <Menu size={20} className="text-slate-500" />
        </button>
        <div className="hidden lg:block w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="案件ID、顧客名で検索..." />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Mobile search button */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="p-2.5 rounded-xl active:bg-slate-100 lg:hidden"
        >
          <Search size={20} className="text-slate-500" />
        </button>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg">
          <Monitor size={14} className="text-indigo-500" />
          <span className="text-[10px] text-slate-400">Web</span>
        </div>

        <Link
          href="/settings"
          className={cn(
            "p-2.5 rounded-xl transition-all hidden lg:block",
            pathname === "/settings"
              ? "bg-indigo-50 text-indigo-600"
              : "hover:bg-slate-100 text-slate-500"
          )}
          title="設定"
        >
          <Settings size={20} />
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotOpen(!notOpen)}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 active:bg-slate-200"
          >
            <Bell size={20} className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {notOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotOpen(false)} />
              {/* Desktop: dropdown */}
              <div className="hidden lg:block absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 animate-slide-up">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800">通知</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-4 hover:bg-slate-50 border-b border-slate-50">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        n.type === "urgent" ? "bg-amber-100" :
                        n.type === "cancel" ? "bg-red-100" :
                        n.type === "auto" ? "bg-green-100" : "bg-blue-100"
                      )}>
                        {n.type === "urgent" ? <Zap size={16} className="text-amber-600" /> :
                         n.type === "cancel" ? <XCircle size={16} className="text-red-500" /> :
                         <CheckCircle size={16} className={n.type === "auto" ? "text-green-500" : "text-blue-500"} />}
                      </div>
                      <div>
                        <p className="text-sm text-slate-700">{n.msg}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile: bottom sheet style notifications */}
              <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl animate-sheet-up pb-safe-bottom" style={{ maxHeight: "70vh" }}>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-slate-300 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-5 pb-3">
                  <h3 className="font-bold text-slate-800">通知</h3>
                  <button onClick={() => setNotOpen(false)} className="p-2 rounded-xl active:bg-slate-100">
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>
                <div className="overflow-y-auto px-2 pb-4" style={{ maxHeight: "calc(70vh - 80px)" }}>
                  {NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-4 rounded-2xl active:bg-slate-50 transition-colors">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        n.type === "urgent" ? "bg-amber-100" :
                        n.type === "cancel" ? "bg-red-100" :
                        n.type === "auto" ? "bg-green-100" : "bg-blue-100"
                      )}>
                        {n.type === "urgent" ? <Zap size={18} className="text-amber-600" /> :
                         n.type === "cancel" ? <XCircle size={18} className="text-red-500" /> :
                         <CheckCircle size={18} className={n.type === "auto" ? "text-green-500" : "text-blue-500"} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{n.msg}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
