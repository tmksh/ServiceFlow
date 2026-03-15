"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { LINE_MSGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Zap, RefreshCw, Clock, Shield, MapPin, Building, User,
  Phone, Calendar, Package, FileText, CheckCircle, ArrowDown,
  Clipboard, Key, Plus, X, Eye, Check, AlertTriangle,
} from "lucide-react";
import type { LineMessage } from "@/types";

type LineTab = "inbox" | "formconfig";

const stColor = { pending: "bg-amber-400", registered: "bg-emerald-400", error: "bg-red-400" };
const stLabel = { pending: "未処理", registered: "登録済", error: "要確認" };
const stBadge = {
  pending:    "bg-amber-50 text-amber-700 border border-amber-200",
  registered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  error:      "bg-red-50 text-red-700 border border-red-200",
};

// ─── フォーム設定データ ───────────────────────────────────────────────────────
interface FieldConfig { label: string; section: string; visible: boolean; required: boolean; type: string; locked?: boolean }
const INITIAL_FIELDS: Record<string, FieldConfig> = {
  center:  { label: "センター",          section: "コールセンター情報", visible: true,  required: false, type: "select"    },
  channel: { label: "チャネル",          section: "コールセンター情報", visible: true,  required: false, type: "select"    },
  op:      { label: "オペレーター",      section: "コールセンター情報", visible: true,  required: false, type: "text"      },
  name:    { label: "顧客名",            section: "顧客情報",           visible: true,  required: true,  type: "text",     locked: true },
  phone:   { label: "電話番号",          section: "顧客情報",           visible: true,  required: true,  type: "tel",      locked: true },
  postal:  { label: "郵便番号",          section: "顧客情報",           visible: true,  required: false, type: "text"      },
  pref:    { label: "都道府県",          section: "顧客情報",           visible: true,  required: false, type: "select"    },
  addr:    { label: "住所（詳細）",      section: "顧客情報",           visible: true,  required: false, type: "text"      },
  date:    { label: "希望日",            section: "サービス情報",       visible: true,  required: true,  type: "date",     locked: true },
  time:    { label: "希望時間帯",        section: "サービス情報",       visible: true,  required: false, type: "select"    },
  cat:     { label: "サービスカテゴリ",  section: "サービス情報",       visible: true,  required: false, type: "select"    },
  items:   { label: "品目・荷物内容",    section: "サービス情報",       visible: true,  required: false, type: "text"      },
  note:    { label: "備考・特記事項",    section: "サービス情報",       visible: false, required: false, type: "textarea"  },
};
const SECTION_STYLE: Record<string, { bg: string; border: string; iconColor: string; iconBg: string }> = {
  "コールセンター情報": { bg: "bg-slate-50",      border: "border-slate-200",  iconColor: "text-slate-500",  iconBg: "bg-slate-100"  },
  "顧客情報":           { bg: "bg-blue-50/40",    border: "border-blue-100",   iconColor: "text-blue-600",   iconBg: "bg-blue-50"    },
  "サービス情報":       { bg: "bg-indigo-50/40",  border: "border-indigo-100", iconColor: "text-indigo-600", iconBg: "bg-indigo-50"  },
};
const TYPE_LABEL: Record<string, string> = { text: "テキスト", tel: "電話番号", date: "日付", select: "選択肢", textarea: "テキストエリア" };

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button onClick={() => !disabled && onChange(!value)} disabled={disabled}
      className={cn("relative w-10 h-5 rounded-full transition-colors shrink-0",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        value ? "bg-indigo-500" : "bg-slate-300")}>
      <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform", value ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

function FormConfigPanel() {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [saved, setSaved] = useState(false);
  const toggle = (key: string, prop: "visible" | "required") =>
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], [prop]: !prev[key][prop] } }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const sections = [...new Set(Object.values(fields).map((f) => f.section))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">受電入力フォーム 項目設定</h2>
          <p className="text-xs text-slate-400 mt-0.5">コールセンタースタッフが入力する各項目の表示・必須を管理</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors">
            <Eye size={13} /> フォームをプレビュー
          </button>
          <button onClick={handleSave}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
              saved ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm")}>
            {saved ? <><Check size={13} /> 保存しました</> : <><Clipboard size={13} /> 設定を保存</>}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800">🔒 ロック済み項目（顧客名・電話番号・希望日）はシステム必須のため変更できません</p>
      </div>

      {sections.map((section) => {
        const sectionFields = Object.entries(fields).filter(([, f]) => f.section === section);
        const sc = SECTION_STYLE[section] || SECTION_STYLE["コールセンター情報"];
        const visibleCount = sectionFields.filter(([, f]) => f.visible).length;
        return (
          <div key={section} className={cn("rounded-2xl border overflow-hidden", sc.border)}>
            <div className={cn("flex items-center justify-between px-5 py-3.5", sc.bg)}>
              <div className="flex items-center gap-2.5">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", sc.iconBg)}>
                  <span className={cn("text-xs font-bold", sc.iconColor)}>{visibleCount}</span>
                </div>
                <span className="text-sm font-bold text-slate-700">{section}</span>
                <span className="text-[10px] text-slate-400 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200/60">{visibleCount}/{sectionFields.length} 表示中</span>
              </div>
            </div>
            <div className="bg-white divide-y divide-slate-50">
              <div className="hidden lg:grid grid-cols-[1fr_70px_70px_120px] gap-4 px-5 py-2.5 bg-slate-50/60">
                {["項目名", "表示", "必須", "入力タイプ"].map((h) => (
                  <span key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</span>
                ))}
              </div>
              {sectionFields.map(([key, f]) => (
                <div key={key} className={cn("px-5 py-3.5 transition-colors", !f.visible && "opacity-50", f.locked && "bg-slate-50/40")}>
                  <div className="flex items-center justify-between gap-3 lg:grid lg:grid-cols-[1fr_70px_70px_120px]">
                    <div className="flex items-center gap-2 min-w-0">
                      {f.locked && <Key size={11} className="text-slate-400 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{f.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{key}</p>
                      </div>
                      {f.required && f.visible && <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-medium shrink-0">必須</span>}
                    </div>
                    <div className="flex items-center gap-3 lg:contents">
                      <div className="flex items-center gap-1.5 lg:block"><span className="text-[10px] text-slate-400 lg:hidden">表示</span><Toggle value={f.visible} onChange={() => toggle(key, "visible")} disabled={!!f.locked} /></div>
                      <div className="flex items-center gap-1.5 lg:block"><span className="text-[10px] text-slate-400 lg:hidden">必須</span><Toggle value={f.required} onChange={() => toggle(key, "required")} disabled={!!f.locked || !f.visible} /></div>
                      <span className="hidden lg:inline text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-lg font-mono">{TYPE_LABEL[f.type] || f.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* 選択肢カスタマイズ */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center"><span className="text-xs font-bold text-violet-600">✎</span></div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">選択肢のカスタマイズ</h3>
            <p className="text-xs text-slate-400">センター・チャネル・時間帯などの選択肢を編集</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "センター名", values: ["ネコ", "わん"] },
            { label: "チャネル",   values: ["受電", "LINE", "Web"] },
            { label: "希望時間帯", values: ["9-12時", "10-12時", "12-15時", "14-17時", "15-18時", "時間指定なし"] },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">{item.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.values.map((v) => (
                  <div key={v} className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                    {v}<button className="text-slate-300 hover:text-red-400 ml-0.5 transition-colors"><X size={10} /></button>
                  </div>
                ))}
                <button className="flex items-center gap-1 px-2.5 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                  <Plus size={10} />追加
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function LinePage() {
  const [sel, setSel] = useState<LineMessage | null>(null);
  const [autoMode, setAutoMode] = useState(true);
  const [lineTab, setLineTab] = useState<LineTab>("inbox");
  const pending = LINE_MSGS.filter((m) => m.status === "pending").length;

  return (
    <PullToRefresh onRefresh={() => {}}>
      <div className="space-y-4 lg:space-y-5 animate-fade-in">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-slate-900">LINE受信</h1>
            <p className="text-xs text-slate-400 mt-1">LINE → TimeTree の手動転記を自動化</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <Shield size={14} className="text-indigo-600" />
              <span className="text-xs font-medium text-slate-600">自動登録</span>
              <button onClick={() => setAutoMode(!autoMode)}
                className={cn("relative w-10 h-5 rounded-full transition-colors ml-1", autoMode ? "bg-indigo-600" : "bg-slate-300")}>
                <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform", autoMode ? "translate-x-5" : "translate-x-0.5")} />
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-dot" />
              <span className="text-xs font-medium text-emerald-700">LINE連携中</span>
            </div>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-slate-200/60 shadow-sm w-fit">
          {([["inbox","LINE自動取込",Zap],["formconfig","フォーム設定",Clipboard]] as [LineTab, string, React.ElementType][]).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setLineTab(k)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                lineTab === k ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}>
              <Icon size={14} />{l}
              {k === "inbox" && pending > 0 && <span className="w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pending}</span>}
            </button>
          ))}
        </div>

        {/* ===== LINE自動取込タブ ===== */}
        {lineTab === "inbox" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: Zap,      v: "847",   l: "今月の自動取込", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: RefreshCw,v: "98.2%", l: "自動認識精度",   color: "text-blue-600",    bg: "bg-blue-50"    },
                { icon: Clock,    v: "~3秒",  l: "平均処理時間",   color: "text-violet-600",   bg: "bg-violet-50"  },
              ].map((s, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl liquid-glass liquid-glass-shimmer flex items-center gap-2.5 px-3 py-2.5">
                  <div className={cn("w-7 h-7 rounded-lg items-center justify-center shrink-0 liquid-glass-icon hidden lg:flex", s.bg)}>
                    <s.icon size={14} className={s.color} />
                  </div>
                  <div><p className={cn("text-sm font-bold", s.color)}>{s.v}</p><p className="text-[10px] text-slate-400">{s.l}</p></div>
                </div>
              ))}
            </div>

            {/* Desktop: Two column layout */}
            <div className="hidden lg:grid grid-cols-5 gap-4" style={{ minHeight: 480 }}>
              <Card className="col-span-2 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/60">
                  <h3 className="font-bold text-slate-800 text-sm">受信メッセージ</h3>
                  <p className="text-xs text-slate-400">{pending}件 未処理</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {LINE_MSGS.map((m) => (
                    <div key={m.id} onClick={() => setSel(m)}
                      className={cn("flex items-start gap-3 p-4 border-b border-white/40 cursor-pointer transition-colors",
                        sel?.id === m.id ? "bg-indigo-50/60" : "hover:bg-white/40")}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: "#06C755" }}>{m.center}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-800">{m.group}</span><span className="text-xs text-slate-400">{m.time}</span></div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{m.raw.split("\n")[1]}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={cn("w-2 h-2 rounded-full", stColor[m.status])} />
                          <span className="text-[10px] text-slate-400">{stLabel[m.status]}</span>
                          {m.status === "error" && <span className="text-[10px] text-red-500 font-medium">⚠ 情報不足</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="col-span-3 flex flex-col overflow-hidden">
                {sel ? <ParsedPreview msg={sel} /> : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">メッセージを選択してください</div>
                )}
              </Card>
            </div>

            {/* Mobile: Message list */}
            <div className="lg:hidden space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-slate-800 text-sm">受信メッセージ</h3>
                <span className="text-xs text-slate-400">{pending}件 未処理</span>
              </div>
              {LINE_MSGS.map((m) => (
                <div key={m.id} className="relative overflow-hidden rounded-2xl liquid-glass liquid-glass-shimmer p-3 active:scale-[0.99] transition-transform cursor-pointer" onClick={() => setSel(m)}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: "#06C755" }}>{m.center}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-800">{m.group}</span><Badge className={stBadge[m.status]}>{stLabel[m.status]}</Badge></div>
                      <p className="text-xs text-slate-500 truncate mt-1">{m.raw.split("\n")[1]}</p>
                      <p className="text-xs text-slate-400 mt-1">{m.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <BottomSheet open={!!sel && typeof window !== "undefined" && window.innerWidth < 1024} onClose={() => setSel(null)} title="メッセージ解析">
              {sel && <ParsedPreview msg={sel} />}
            </BottomSheet>
          </>
        )}

        {/* ===== フォーム設定タブ ===== */}
        {lineTab === "formconfig" && <FormConfigPanel />}
      </div>
    </PullToRefresh>
  );
}

function ParsedPreview({ msg }: { msg: LineMessage }) {
  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">メッセージ解析プレビュー</h3>
        <Badge className={stBadge[msg.status]}>{stLabel[msg.status]}</Badge>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">受信テキスト（LINE原文）</p>
          <div className="bg-slate-800 rounded-xl p-3 lg:p-4 font-mono text-xs text-green-400 whitespace-pre-wrap leading-relaxed">
            {msg.raw}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-indigo-500">
          <Zap size={16} /><span className="text-xs font-bold">AI自動解析</span><ArrowDown size={16} />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">解析結果（構造化データ）</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { icon: MapPin, l: "エリア", v: msg.parsed.pref },
              { icon: Building, l: "コールセンター", v: `${msg.parsed.center}（${msg.parsed.ch}）` },
              { icon: User, l: "顧客名", v: msg.parsed.name },
              { icon: Phone, l: "電話番号", v: msg.parsed.phone },
              { icon: MapPin, l: "住所", v: msg.parsed.addr },
              { icon: Calendar, l: "希望日時", v: `${msg.parsed.date} ${msg.parsed.time}` },
              { icon: Package, l: "品目", v: msg.parsed.items },
              { icon: FileText, l: "備考", v: msg.parsed.note || "なし" },
            ].map(({ icon: II, l, v }) => (
              <div key={l} className={cn("flex items-start gap-2.5 p-3 rounded-xl border",
                v.includes("未記載") || v.includes("不明") || v.includes("⚠") ? "bg-red-50 border-red-200" : "liquid-glass border-white/60")}>
                <II size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <div><p className="text-[10px] text-slate-400">{l}</p><p className="text-sm font-medium text-slate-700">{v}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {msg.status === "pending" && (
            <>
              <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium active:bg-indigo-700 flex items-center justify-center gap-2">
                <CheckCircle size={16} /> 案件として登録
              </button>
              <button className="px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium active:bg-slate-50">
                編集して登録
              </button>
            </>
          )}
          {msg.status === "error" && (
            <button className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-medium active:bg-amber-600 flex items-center justify-center gap-2">
              <FileText size={16} /> 手動で情報を補完
            </button>
          )}
          {msg.status === "registered" && (
            <div className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium text-center border border-emerald-200">
              ✓ CS-0023 として登録済み
            </div>
          )}
        </div>
      </div>
    </>
  );
}
