"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { STATUS_MAP } from "@/lib/constants";
import { fmt, cn } from "@/lib/utils";
import type { Case } from "@/types";
import {
  X, Phone, Activity, Check, User, Calendar,
  MapPin, FileText, ChevronRight, Zap,
  Building2, CreditCard, Radio, Hash, Truck,
  MessageSquare, Send, SmilePlus,
} from "lucide-react";

interface QuickCaseModalProps {
  c: Case;
  onClose: () => void;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  color: string;
  text: string;
  time: string;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: 1, author: "田中",  avatar: "田", color: "#6366f1", text: "現場確認済み。搬出経路は北側玄関から。", time: "10:30" },
  { id: 2, author: "佐藤",  avatar: "佐", color: "#8b5cf6", text: "見積送付しました。返答待ちです。", time: "11:05" },
];

const ME = { author: "加藤", avatar: "加", color: "#14b8a6" };

export function QuickCaseModal({ c, onClose }: QuickCaseModalProps) {
  const [status, setStatus] = useState(c.status);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const payLabel = c.payMethod === "cash" ? "現金" : c.payMethod === "credit" ? "クレジット" : "未定";

  function sendComment() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...ME,
        text,
        time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
      },
    ]);
    setDraft("");
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendComment();
    }
  }

  // テキストエリアの高さを内容に合わせて自動調整
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 96)}px`;
    }
  }, [draft]);

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex flex-col justify-end lg:justify-center lg:items-center p-0 lg:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full lg:w-[520px] bg-white lg:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col"
        style={{ height: "calc(100dvh - 56px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル（モバイル） */}
        <div className="flex justify-center pt-2.5 pb-0 lg:hidden shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
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

        {/* スクロール本体 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">

          {/* ステータス変更 + 電話 */}
          <div className="flex gap-2 px-4 pt-4 pb-2">
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
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium active:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={15} /> 電話
            </a>
          </div>

          {/* セクション：顧客情報 */}
          <Section label="顧客情報">
            <InfoGrid items={[
              { icon: User,     l: "顧客名",   v: c.customer },
              { icon: Phone,    l: "電話番号", v: c.phone },
              { icon: Hash,     l: "郵便番号", v: c.postal },
              { icon: Calendar, l: "日時",     v: `${c.date} ${c.time}` },
            ]} />
            <InfoRow icon={MapPin} l="住所" v={c.addr} />
          </Section>

          {/* セクション：案件情報 */}
          <Section label="案件情報">
            <InfoGrid items={[
              { icon: FileText,   l: "案件ID",       v: c.id },
              { icon: Activity,   l: "金額",         v: c.amount > 0 ? fmt(c.amount) : "未確定" },
              { icon: Building2,  l: "センター",     v: c.center },
              { icon: User,       l: "担当スタッフ", v: c.staff },
              { icon: Radio,      l: "集客チャネル", v: c.channel },
              { icon: Truck,      l: "集客元",       v: c.source },
              { icon: CreditCard, l: "支払方法",     v: payLabel },
            ]} />
          </Section>

          {/* セクション：品目 */}
          {c.items.length > 0 && (
            <Section label={`品目リスト（${c.items.length}点）`}>
              <div className="px-4 pb-1 flex flex-wrap gap-1.5">
                {c.items.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{ backgroundColor: c.category.color + "18", color: c.category.color }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* フラグ */}
          {(c.urgent || c.lineAuto) && (
            <Section label="フラグ">
              <div className="px-4 pb-2 space-y-2">
                {c.urgent && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <Zap size={15} className="text-amber-500 shrink-0" />
                    <p className="text-sm font-semibold text-amber-700">緊急案件</p>
                  </div>
                )}
                {c.lineAuto && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-green-50 border border-green-100">
                    <div className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0" style={{ background: "#06C755" }}>
                      <span className="text-white text-[9px] font-black">L</span>
                    </div>
                    <p className="text-sm font-semibold text-green-700">LINE自動取込</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* セクション：コメント */}
          <Section label={`コメント（${comments.length}）`}>
            <div className="px-4 pb-2 space-y-3">
              {comments.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400">
                  <MessageSquare size={20} className="mx-auto mb-1 opacity-30" />
                  まだコメントはありません
                </div>
              )}
              {comments.map((cm) => {
                const isMe = cm.author === ME.author;
                return (
                  <div key={cm.id} className={cn("flex gap-2.5", isMe && "flex-row-reverse")}>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: cm.color }}
                    >
                      {cm.avatar}
                    </div>
                    <div className={cn("max-w-[75%]", isMe && "items-end flex flex-col")}>
                      <div className={cn("flex items-center gap-1.5 mb-1", isMe && "flex-row-reverse")}>
                        <span className="text-[10px] font-semibold text-slate-600">{cm.author}</span>
                        <span className="text-[10px] text-slate-300">{cm.time}</span>
                      </div>
                      <div
                        className={cn(
                          "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                          isMe
                            ? "bg-indigo-500 text-white rounded-tr-sm"
                            : "bg-slate-100 text-slate-700 rounded-tl-sm"
                        )}
                      >
                        {cm.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* アクション */}
          <div className="px-4 pt-2 pb-3 space-y-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.addr)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium active:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <MapPin size={15} className="text-indigo-500" /> Google マップで確認
            </a>
            <Link
              href="/cases"
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold active:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
            >
              <FileText size={15} /> 案件詳細ページへ <ChevronRight size={14} />
            </Link>
          </div>

          {/* コメント入力（最下部に余白） */}
          <div className="h-20" />
        </div>

        {/* コメント入力バー（底面固定） */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-2.5 flex items-end gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mb-0.5"
            style={{ backgroundColor: ME.color }}
          >
            {ME.avatar}
          </div>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="コメントを入力…"
              rows={1}
              className="w-full resize-none px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 leading-relaxed placeholder:text-slate-300"
              style={{ maxHeight: 96 }}
            />
          </div>
          <button
            onClick={sendComment}
            disabled={!draft.trim()}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-all",
              draft.trim()
                ? "bg-indigo-500 text-white active:bg-indigo-600"
                : "bg-slate-100 text-slate-300"
            )}
          >
            <Send size={15} className={draft.trim() ? "translate-x-0.5" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 内部コンポーネント ──────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-4 mb-2">{label}</p>
      {children}
    </div>
  );
}

function InfoGrid({ items }: { items: { icon: React.ElementType; l: string; v: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-1">
      {items.map(({ icon: Icon, l, v }) => (
        <div key={l} className="flex items-start gap-2.5 p-3 rounded-xl liquid-glass">
          <Icon size={13} className="text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400">{l}</p>
            <p className="text-sm font-medium text-slate-700 break-all leading-snug">{v}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ icon: Icon, l, v }: { icon: React.ElementType; l: string; v: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 mx-4 mb-1 rounded-xl liquid-glass">
      <Icon size={13} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400">{l}</p>
        <p className="text-sm font-medium text-slate-700">{v}</p>
      </div>
    </div>
  );
}
