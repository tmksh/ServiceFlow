"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { STATUS_MAP } from "@/lib/constants";
import { fmt, cn } from "@/lib/utils";
import type { Case } from "@/types";
import {
  X, Phone, Activity, Check, User, Calendar,
  MapPin, FileText, ChevronRight, Zap,
} from "lucide-react";

interface QuickCaseModalProps {
  c: Case;
  onClose: () => void;
}

export function QuickCaseModal({ c, onClose }: QuickCaseModalProps) {
  const [status, setStatus] = useState(c.status);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex flex-col justify-end lg:justify-center lg:items-center p-0 lg:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full lg:w-[520px] bg-white lg:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] lg:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル（モバイル） */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: c.category.color }}
            >
              {c.category.label[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900 truncate">{c.id} — {c.customer}</h2>
                <Badge className={STATUS_MAP[status].className}>{STATUS_MAP[status].label}</Badge>
                {c.urgent && (
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                    <Zap size={9} />緊急
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{c.category.label} · {c.date} {c.time}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 shrink-0 ml-2">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* ボディ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {([
              { icon: User,     l: "顧客名",   v: c.customer },
              { icon: Phone,    l: "電話番号", v: c.phone },
              { icon: MapPin,   l: "住所",     v: c.addr },
              { icon: Calendar, l: "日時",     v: `${c.date} ${c.time}` },
              { icon: Activity, l: "金額",     v: c.amount > 0 ? fmt(c.amount) : "未確定" },
              { icon: User,     l: "担当",     v: c.staff },
            ] as { icon: React.ElementType; l: string; v: string }[]).map(({ icon: Icon, l, v }) => (
              <div key={l} className="flex items-start gap-2.5 p-3 rounded-xl liquid-glass">
                <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400">{l}</p>
                  <p className="text-sm font-medium text-slate-700 break-all">{v}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ステータス変更 + 電話 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <button
                onClick={() => setStatusMenuOpen((v) => !v)}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2",
                  STATUS_MAP[status].className
                )}
              >
                <Activity size={15} /> {STATUS_MAP[status].label} ▾
              </button>
              {statusMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setStatusMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                    {(Object.keys(STATUS_MAP) as Array<keyof typeof STATUS_MAP>).map((s) => (
                      <button
                        key={s}
                        onClick={() => { setStatus(s); setStatusMenuOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-slate-50",
                          s === status ? "font-semibold" : "text-slate-600"
                        )}
                      >
                        {STATUS_MAP[s].label}
                        {s === status && <Check size={13} className="ml-auto text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <a
              href={`tel:${c.phone}`}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={15} /> 電話
            </a>
          </div>

          {/* マップ */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.addr)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin size={15} className="text-indigo-500" /> Google マップで確認
          </a>

          {/* 案件詳細へ */}
          <Link
            href="/cases"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={15} /> 案件詳細ページへ <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
