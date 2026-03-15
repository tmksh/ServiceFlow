"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CASES } from "@/lib/mock-data";
import { STATUS_MAP, CATEGORIES, STAFF } from "@/lib/constants";
import { cn, fmt } from "@/lib/utils";
import type { Case, CaseStatus } from "@/types";
import {
  Plus, FileText, Users, Phone, MapPin, Zap, Calendar,
  X, User, CreditCard, Package, Star, Activity, MessageSquare,
  Clock, ChevronRight, Send, Image, Check, ArrowLeft,
  Building2, Tag, ChevronLeft,
} from "lucide-react";

// ─── 型 ──────────────────────────────────────────────────────────────────────
interface Comment { id: number; author: string; avatar: string; time: string; text: string }

// ─── 新規案件モーダル ────────────────────────────────────────────────────────
const STEPS = ["カテゴリ", "顧客情報", "案件詳細", "確認"] as const;
const CHANNELS = ["受電", "LINE", "Web"] as const;
const TIME_OPTIONS = ["未定", "9-12時", "10-12時", "13-15時", "14-16時", "15-17時", "終日"];

function NewCaseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    category: null as (typeof CATEGORIES[number]) | null,
    name: "", phone: "", postal: "", addr: "",
    date: "", time: "", staff: "", amount: "", channel: "受電" as string, note: "",
  });

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.category;
    if (step === 1) return !!form.name.trim() && !!form.phone.trim();
    if (step === 2) return !!form.date.trim() && !!form.staff;
    return true;
  };

  if (!open) return null;

  const inputCls = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:justify-center lg:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full lg:w-[520px] bg-white lg:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] lg:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronLeft size={18} className="text-slate-500" />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900">新規案件登録</h2>
              <p className="text-xs text-slate-400">ステップ {step + 1} / {STEPS.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* プログレス */}
        <div className="px-5 pt-3 pb-1">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={cn("h-1 rounded-full flex-1 transition-all duration-300", i <= step ? "bg-indigo-500" : "bg-slate-100")} />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {STEPS.map((s, i) => (
              <span key={i} className={cn("text-[10px] font-medium",
                i === step ? "text-indigo-600" : i < step ? "text-slate-400" : "text-slate-300"
              )}>{s}</span>
            ))}
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* STEP 0: カテゴリ */}
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 mb-3">サービスカテゴリを選んでください</p>
              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => set("category", cat)}
                    className={cn(
                      "flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all",
                      form.category?.id === cat.id
                        ? "border-indigo-400 bg-indigo-50 shadow-sm"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                    )}>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                      style={{ background: cat.color + "20" }}>
                      <span style={{ color: cat.color }}>●</span>
                    </div>
                    <span className={cn("text-sm font-semibold",
                      form.category?.id === cat.id ? "text-indigo-700" : "text-slate-700"
                    )}>{cat.label}</span>
                    {form.category?.id === cat.id && <Check size={14} className="text-indigo-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: 顧客情報 */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">顧客の基本情報を入力してください</p>
              {([
                { label: "顧客名", key: "name" as const, placeholder: "例: 山田 太郎", required: true },
                { label: "電話番号", key: "phone" as const, placeholder: "例: 090-1234-5678", required: true, type: "tel" },
                { label: "郵便番号", key: "postal" as const, placeholder: "例: 123-4567" },
                { label: "住所", key: "addr" as const, placeholder: "例: 東京都新宿区○○1-2-3" },
              ]).map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <input type={f.type ?? "text"} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder} className={inputCls} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">受電チャネル</label>
                <div className="flex gap-2">
                  {CHANNELS.map((ch) => (
                    <button key={ch} onClick={() => set("channel", ch)}
                      className={cn("flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all",
                        form.channel === ch ? "bg-indigo-50 border-indigo-400 text-indigo-700" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                      )}>{ch}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 案件詳細 */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">作業日時・担当者・金額を設定してください</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">作業日 <span className="text-red-400">*</span></label>
                  <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">時間帯</label>
                  <select value={form.time} onChange={(e) => set("time", e.target.value)} className={inputCls}>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">担当者 <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {STAFF.map((s) => (
                    <button key={s} onClick={() => set("staff", s)}
                      className={cn("py-2 rounded-xl text-sm font-medium border-2 transition-all",
                        form.staff === s ? "bg-indigo-50 border-indigo-400 text-indigo-700" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                      )}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">概算金額</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">¥</span>
                  <input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)}
                    placeholder="0" className={cn(inputCls, "pl-8")} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">メモ・備考</label>
                <textarea value={form.note} onChange={(e) => set("note", e.target.value)}
                  placeholder="特記事項、持込不可品、アクセス情報など" rows={3}
                  className={cn(inputCls, "resize-none")} />
              </div>
            </div>
          )}

          {/* STEP 3: 確認 */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">内容を確認して登録してください</p>
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: (form.category?.color ?? "#6366f1") + "20" }}>
                  <Tag size={18} style={{ color: form.category?.color ?? "#6366f1" }} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">カテゴリ</p>
                  <p className="text-sm font-semibold text-slate-800">{form.category?.label}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">顧客情報</p>
                {([["氏名", form.name], ["電話", form.phone], ["住所", [form.postal, form.addr].filter(Boolean).join(" ")], ["チャネル", form.channel]] as [string, string][])
                  .filter(([, v]) => v).map(([l, v]) => (
                    <div key={l} className="flex items-start gap-2">
                      <span className="text-xs text-slate-400 w-12 shrink-0 pt-0.5">{l}</span>
                      <span className="text-sm text-slate-700 font-medium">{v}</span>
                    </div>
                  ))}
              </div>
              <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">案件詳細</p>
                {([["作業日", form.date], ["時間帯", form.time || "未定"], ["担当者", form.staff], ["概算", form.amount ? `¥${Number(form.amount).toLocaleString()}` : "未定"], ["メモ", form.note]] as [string, string][])
                  .filter(([, v]) => v).map(([l, v]) => (
                    <div key={l} className="flex items-start gap-2">
                      <span className="text-xs text-slate-400 w-12 shrink-0 pt-0.5">{l}</span>
                      <span className="text-sm text-slate-700 font-medium">{v}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-5 py-4 border-t border-slate-100">
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
              className={cn("w-full py-3 rounded-2xl text-sm font-semibold transition-all",
                canNext()
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}>次へ</button>
          ) : (
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
              <Check size={16} /> 案件を登録する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 案件詳細モーダル ────────────────────────────────────────────────────────
function CaseDetailModal({ c, onClose }: { c: Case; onClose: () => void }) {
  const [dtab, setDtab] = useState<"detail" | "comments" | "photos">("detail");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, author: "加藤", avatar: "加", time: "10:23", text: "相見積もりとのこと。価格は強気で。" },
    { id: 2, author: "田中", avatar: "田", time: "11:05", text: "現地確認済み。2t車1台で対応可能です。" },
  ]);
  const [memo, setMemo] = useState("2月末までに目視希望。相見積もりあり。");
  const [status, setStatus] = useState<CaseStatus>(c.status);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const addComment = () => {
    if (!comment.trim()) return;
    const now = new Date();
    setComments((prev) => [...prev, {
      id: Date.now(), author: "加藤", avatar: "加",
      time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
      text: comment,
    }]);
    setComment("");
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: c.category.color }}>
              {c.category.label[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900 truncate">{c.id} — {c.customer}</h2>
                <Badge className={STATUS_MAP[c.status].className}>{STATUS_MAP[c.status].label}</Badge>
                {c.urgent && <Badge className="bg-amber-100 text-amber-700 border border-amber-200"><Zap size={10} />緊急</Badge>}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{c.category.label} · {c.date} {c.time}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 shrink-0 ml-2">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* タブバー */}
        <div className="flex gap-1 px-5 pt-3 shrink-0">
          {([
            ["detail", "詳細", FileText],
            ["comments", "コメント", MessageSquare],
            ["photos", "写真", Image],
          ] as [string, string, React.ElementType][]).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setDtab(k as typeof dtab)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                dtab === k ? "bg-indigo-50 text-indigo-700" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}>
              <Icon size={14} />{l}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ── 詳細タブ ── */}
          {dtab === "detail" && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  { icon: User,       l: "顧客名",       v: c.customer },
                  { icon: Phone,      l: "電話番号",     v: c.phone },
                  { icon: MapPin,     l: "住所",         v: c.addr },
                  { icon: Calendar,   l: "日時",         v: `${c.date} ${c.time}` },
                  { icon: Activity,   l: "金額",         v: c.amount > 0 ? fmt(c.amount) : "未確定" },
                  { icon: User,       l: "担当スタッフ", v: c.staff },
                  { icon: CreditCard, l: "決済方法",     v: c.payMethod === "credit" ? "クレジット" : c.payMethod === "cash" ? "現金" : "—" },
                  { icon: Building2,  l: "センター",     v: `${c.center}（${c.channel}）` },
                  { icon: Package,    l: "品目",         v: c.items.join("、") },
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
              <div className="flex gap-2 flex-wrap">
                {/* ステータス更新 */}
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
                        {(Object.keys(STATUS_MAP) as CaseStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => { setStatus(s); setStatusMenuOpen(false); }}
                            className={cn(
                              "w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-slate-50",
                              s === status ? "font-semibold" : "text-slate-600"
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full", STATUS_MAP[s].className.split(" ")[0])} />
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
                  <Phone size={15} /> 電話発信
                </a>
              </div>
              {/* 地図で見る */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.addr)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <MapPin size={15} className="text-indigo-500" /> Google マップで住所を確認
              </a>
            </div>
          )}

          {/* ── コメント・メモタブ ── */}
          {dtab === "comments" && (
            <div className="p-5 space-y-5">
              {/* メモ */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">メモ（スタッフ共有）</p>
                <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                  placeholder="案件に関するメモを入力..." />
              </div>
              {/* コメント履歴 */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">コメント履歴</p>
                <div className="space-y-3">
                  {comments.map((cm) => (
                    <div key={cm.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {cm.avatar}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-700">{cm.author}</span>
                          <span className="text-xs text-slate-400">{cm.time}</span>
                        </div>
                        <p className="text-sm text-slate-600">{cm.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* コメント入力 */}
              <div className="flex gap-2">
                <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addComment()}
                  placeholder="コメントを入力... (Enter で送信)"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                <button onClick={addComment}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── 写真タブ ── */}
          {dtab === "photos" && (
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "作業前", bg: "#f1f5f9" },
                  { label: "作業中", bg: "#f8fafc" },
                  { label: "作業後", bg: "#f0fdf4" },
                ].map((ph) => (
                  <div key={ph.label}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                    style={{ background: ph.bg }}>
                    <Image size={28} className="text-slate-300" />
                    <span className="text-xs text-slate-400">{ph.label}</span>
                  </div>
                ))}
                <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                  <Plus size={24} className="text-slate-300" />
                  <span className="text-xs text-slate-400">写真を追加</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-center mt-4">JPG / PNG / HEIC · 最大10MB / 枚</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── メインページ ─────────────────────────────────────────────────────────────
export default function CasesPage() {
  const [view, setView] = useState<"cases" | "customers">("cases");
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState<CaseStatus | "all">("all");
  const [sel, setSel] = useState<Case | null>(null);
  const [sortKey, setSortKey] = useState<"total" | "cases" | "last" | "name">("total");
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const filtered = useMemo(() =>
    CASES.filter((c) =>
      (!search || c.customer.includes(search) || c.id.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)) &&
      (sf === "all" || c.status === sf)
    ), [search, sf]);

  const counts = useMemo(() => {
    const o: Record<string, number> = { all: CASES.length };
    (Object.keys(STATUS_MAP) as CaseStatus[]).forEach((s) => { o[s] = CASES.filter((c) => c.status === s).length; });
    return o;
  }, []);

  const custs = useMemo(() => {
    const map: Record<string, { name: string; phone: string; pref: string; cases: Case[]; total: number; last: string; cats: Set<string> }> = {};
    CASES.forEach((c) => {
      if (!map[c.customer]) map[c.customer] = { name: c.customer, phone: c.phone, pref: c.pref, cases: [], total: 0, last: c.date, cats: new Set() };
      map[c.customer].cases.push(c);
      map[c.customer].total += c.amount;
      map[c.customer].cats.add(c.category.label);
      if (c.date > map[c.customer].last) map[c.customer].last = c.date;
    });
    return Object.values(map);
  }, []);

  const custFiltered = useMemo(() => {
    const arr = custs.filter((c) => !search || c.name.includes(search) || c.phone.includes(search));
    if (sortKey === "total") return arr.sort((a, b) => b.total - a.total);
    if (sortKey === "cases") return arr.sort((a, b) => b.cases.length - a.cases.length);
    if (sortKey === "last") return arr.sort((a, b) => b.last.localeCompare(a.last));
    return arr.sort((a, b) => a.name.localeCompare(b.name));
  }, [custs, search, sortKey]);

  const vipThreshold = custs.length > 2 ? [...custs].sort((a, b) => b.total - a.total)[2]?.total ?? 0 : 0;
  const CUST_COLORS = ["bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

  const pagedCases = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="space-y-4 lg:space-y-5 animate-fade-in">

        {/* ヘッダー（デスクトップ） */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-slate-900">案件管理</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* ビュー切替 */}
            <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200/60 shadow-sm">
              {([["cases", "案件一覧", FileText], ["customers", "顧客一覧", Users]] as const).map(([k, l, Icon]) => (
                <button key={k} onClick={() => setView(k)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    view === k ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}>
                  <Icon size={14} />{l}
                </button>
              ))}
            </div>
            <button onClick={() => setNewCaseOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors">
              <Plus size={15} /> 新規案件
            </button>
          </div>
        </div>

        {/* ===== 案件ビュー ===== */}
        {view === "cases" && (
          <>
            <Card className="p-3 lg:p-4">
              <SearchInput value={search} onChange={setSearch} placeholder="案件ID、顧客名、電話番号で検索..." />
              <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                <button onClick={() => { setSf("all"); setPage(1); }}
                  className={cn("shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5",
                    sf === "all" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}>
                  すべて <span className={cn("px-1.5 py-0.5 rounded-full text-[10px]", sf === "all" ? "bg-indigo-500" : "bg-slate-100")}>{counts.all}</span>
                </button>
                {(Object.entries(STATUS_MAP) as [CaseStatus, { label: string; className: string }][]).map(([k, v]) => (
                  <button key={k} onClick={() => { setSf(k); setPage(1); }}
                    className={cn("shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5",
                      sf === k ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}>
                    {v.label} <span className={cn("px-1.5 py-0.5 rounded-full text-[10px]", sf === k ? "bg-indigo-500" : "bg-slate-100")}>{counts[k]}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* モバイル: カードリスト */}
            <div className="lg:hidden space-y-2">
              {pagedCases.map((c) => (
                <div key={c.id} className="relative overflow-hidden rounded-2xl liquid-glass liquid-glass-shimmer p-4 active:scale-[0.99] cursor-pointer transition-transform duration-150" onClick={() => setSel(c)}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
                      style={{ background: c.category.color }}>
                      {c.category.label[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-bold text-slate-800 truncate">{c.customer}</span>
                          {c.urgent && <Zap size={13} className="text-amber-500 shrink-0" />}
                          {c.lineAuto && <span className="shrink-0 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">LINE</span>}
                        </div>
                        <Badge className={cn(STATUS_MAP[c.status].className, "shrink-0 text-[10px]")}>{STATUS_MAP[c.status].label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="font-mono">{c.id}</span>
                        <span className="flex items-center gap-0.5"><MapPin size={10} />{c.pref}</span>
                        <span className="flex items-center gap-0.5"><Clock size={10} />{c.date.slice(5)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-slate-500">{c.staff}</span>
                        <span className="text-sm font-bold text-slate-700">
                          {c.amount > 0 ? fmt(c.amount) : <span className="text-slate-300 font-normal text-xs">未確定</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length > PAGE_SIZE && (
                <div className="flex gap-1 justify-center pt-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                        page === i + 1 ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
                      )}>{i + 1}</button>
                  ))}
                </div>
              )}
            </div>

            {/* デスクトップ: テーブル */}
            <Card className="overflow-hidden hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {["案件ID", "顧客名", "カテゴリ", "エリア", "日時", "ステータス", "金額", "担当"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCases.map((c) => (
                      <tr key={c.id} onClick={() => setSel(c)}
                        className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors cursor-pointer group">
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-mono font-semibold text-indigo-600">{c.id}</span>
                          {c.urgent && <Zap size={13} className="inline ml-1 text-amber-500" />}
                          {c.lineAuto && <span className="ml-1 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">LINE</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-medium text-slate-800">{c.customer}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={11} />{c.phone}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                              style={{ background: c.category.color + "20", color: c.category.color }}>
                              {c.category.label[0]}
                            </div>
                            <span className="text-sm text-slate-600">{c.category.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          <span className="flex items-center gap-1"><MapPin size={13} className="text-slate-400" />{c.pref}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm text-slate-700">{c.date}</div>
                          <div className="text-xs text-slate-400">{c.time}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge className={STATUS_MAP[c.status].className}>{STATUS_MAP[c.status].label}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">
                          {c.amount > 0 ? fmt(c.amount) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">{c.staff}</span>
                            <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}件
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
                    <ChevronLeft size={16} className="text-slate-500" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                          page === p ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
                        )}>{p}</button>
                    );
                  })}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
                    <ChevronRight size={16} className="text-slate-500" />
                  </button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ===== 顧客ビュー ===== */}
        {view === "customers" && (
          <>
            {/* モバイル：コンパクトKPIバー */}
            <div className="lg:hidden flex items-center bg-white rounded-2xl border border-slate-200/60 shadow-sm divide-x divide-slate-100 overflow-hidden">
              {[
                { label: "顧客", value: `${custs.length}名`, color: "text-indigo-600" },
                { label: "VIP", value: `${custs.filter((c) => c.total >= vipThreshold).length}名`, color: "text-amber-600" },
                { label: "平均売上", value: fmt(Math.round(custs.reduce((s, c) => s + c.total, 0) / (custs.length || 1))), color: "text-emerald-600" },
                { label: "リピーター", value: `${custs.filter((c) => c.cases.length >= 15).length}名`, color: "text-violet-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex-1 flex flex-col items-center py-2.5 px-1 min-w-0">
                  <span className={`text-sm font-bold leading-none ${color}`}>{value}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 leading-none truncate">{label}</span>
                </div>
              ))}
            </div>
            {/* デスクトップ：StatCard グリッド */}
            <div className="hidden lg:grid grid-cols-4 gap-4">
              <StatCard icon={Users} label="総顧客数" value={`${custs.length}名`} gradientFrom="#6366f1" gradientTo="#818cf8" />
              <StatCard icon={Star} label="VIP顧客" value={`${custs.filter((c) => c.total >= vipThreshold).length}名`} gradientFrom="#f59e0b" gradientTo="#fbbf24" />
              <StatCard icon={Activity} label="平均売上" value={fmt(Math.round(custs.reduce((s, c) => s + c.total, 0) / (custs.length || 1)))} gradientFrom="#10b981" gradientTo="#34d399" />
              <StatCard icon={Activity} label="リピーター" value={`${custs.filter((c) => c.cases.length >= 15).length}名`} gradientFrom="#8b5cf6" gradientTo="#a78bfa" />
            </div>

            <Card className="p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                <div className="flex-1 w-full lg:max-w-sm">
                  <SearchInput value={search} onChange={setSearch} placeholder="顧客名・電話番号で検索..." />
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                  {(["total", "cases", "last", "name"] as const).map((k) => {
                    const labels = { total: "売上順", cases: "案件数", last: "最新", name: "名前" };
                    return (
                      <button key={k} onClick={() => setSortKey(k)}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                          sortKey === k ? "bg-white text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}>{labels[k]}</button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* モバイル */}
            <div className="lg:hidden space-y-2">
              {custFiltered.slice(0, 30).map((c, i) => (
                <div key={c.name} className="relative overflow-hidden rounded-2xl liquid-glass liquid-glass-shimmer p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0", CUST_COLORS[i % 6])}>
                      {c.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800">{c.name}</span>
                        {c.total >= vipThreshold && <Badge className="bg-amber-100 text-amber-700 border border-amber-200"><Star size={9} />VIP</Badge>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.phone} · {c.pref}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-800">{fmt(c.total)}</div>
                      <div className="text-xs text-slate-400">{c.cases.length}件</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* デスクトップ */}
            <Card className="overflow-hidden hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {["", "顧客名", "電話番号", "エリア", "案件数", "総売上", "利用カテゴリ", "最終利用", "ステータス"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {custFiltered.slice(0, 30).map((c, i) => (
                      <tr key={c.name} className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer">
                        <td className="px-4 py-3">
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold", CUST_COLORS[i % 6])}>
                            {c.name.slice(0, 2)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                            {c.total >= vipThreshold && <Badge className="bg-amber-100 text-amber-700 border border-amber-200"><Star size={9} />VIP</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 font-mono">{c.phone}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{c.pref}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{c.cases.length}件</td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-800">{fmt(c.total)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {[...c.cats].slice(0, 2).map((cat) => (
                              <span key={cat} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{cat}</span>
                            ))}
                            {c.cats.size > 2 && <span className="text-[10px] text-slate-400">+{c.cats.size - 2}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{c.last.slice(5)}</td>
                        <td className="px-4 py-3">
                          {c.cases.length >= 15
                            ? <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200">リピーター</Badge>
                            : c.cases.length >= 10
                            ? <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">複数利用</Badge>
                            : <Badge className="bg-slate-50 text-slate-500 border border-slate-200">一般</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-400">{custFiltered.length}件中 {Math.min(30, custFiltered.length)}件表示</span>
              </div>
            </Card>
          </>
        )}

        {/* 案件詳細モーダル */}
        {sel && <CaseDetailModal c={sel} onClose={() => setSel(null)} />}

        {/* 新規案件モーダル */}
        <NewCaseModal open={newCaseOpen} onClose={() => setNewCaseOpen(false)} />
      </div>
    </PullToRefresh>
  );
}
