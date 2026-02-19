"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LINE_MSGS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Zap, RefreshCw, Clock, Shield, MapPin, Building, User,
  Phone, Calendar, Package, FileText, CheckCircle, ArrowDown,
} from "lucide-react";
import type { LineMessage } from "@/types";

const stColor = { pending: "bg-amber-400", registered: "bg-emerald-400", error: "bg-red-400" };
const stLabel = { pending: "未処理", registered: "登録済", error: "要確認" };
const stBadge = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  registered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  error: "bg-red-50 text-red-700 border border-red-200",
};

export default function LinePage() {
  const [sel, setSel] = useState<LineMessage>(LINE_MSGS[0]);
  const [autoMode, setAutoMode] = useState(true);
  const pending = LINE_MSGS.filter((m) => m.status === "pending").length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">LINE受信（自動取込）</h1>
          <p className="text-xs text-slate-400 mt-1">LINE → TimeTree の手動転記を自動化</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-dot" />
          <span className="text-sm font-medium text-emerald-700">Webhook接続中</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Zap, v: "847", l: "今月の自動取込", color: "bg-emerald-500", bg: "bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100" },
          { icon: RefreshCw, v: "98.2%", l: "自動認識精度", color: "bg-blue-500", bg: "" },
          { icon: Clock, v: "~3秒", l: "平均処理時間", color: "bg-violet-500", bg: "" },
        ].map((s, i) => (
          <Card key={i} className={cn("p-5", s.bg)}>
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", s.color)}><s.icon size={20} className="text-white" /></div>
              <div><p className="text-2xl font-bold text-slate-900">{s.v}</p><p className="text-sm text-slate-500">{s.l}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl"><Shield size={18} className="text-indigo-600" /></div>
            <div><h3 className="font-semibold text-slate-800">自動案件登録モード</h3><p className="text-xs text-slate-400">LINEメッセージを自動解析し案件として即時登録</p></div>
          </div>
          <button onClick={() => setAutoMode(!autoMode)} className={cn("relative w-14 h-7 rounded-full transition-colors", autoMode ? "bg-indigo-600" : "bg-slate-300")}>
            <div className={cn("absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform", autoMode ? "translate-x-7" : "translate-x-0.5")} />
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: 480 }}>
        {/* Message List */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">受信メッセージ</h3>
            <p className="text-xs text-slate-400">{pending}件 未処理</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {LINE_MSGS.map((m) => (
              <div key={m.id} onClick={() => setSel(m)}
                className={cn("flex items-start gap-3 p-4 border-b border-slate-50 cursor-pointer transition-colors",
                  sel?.id === m.id ? "bg-indigo-50" : "hover:bg-slate-50")}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: "#06C755" }}>
                  {m.center}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">{m.group}</span>
                    <span className="text-xs text-slate-400">{m.time}</span>
                  </div>
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

        {/* Parsed Preview */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden">
          {sel ? (
            <>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">メッセージ解析プレビュー</h3>
                <Badge className={stBadge[sel.status]}>{stLabel[sel.status]}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">受信テキスト（LINE原文）</p>
                  <div className="bg-slate-800 rounded-xl p-4 font-mono text-xs text-green-400 whitespace-pre-wrap leading-relaxed">
                    {sel.raw}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-indigo-500">
                  <Zap size={16} /><span className="text-xs font-bold">AI自動解析</span><ArrowDown size={16} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">解析結果（構造化データ）</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: MapPin, l: "エリア", v: sel.parsed.pref },
                      { icon: Building, l: "コールセンター", v: `${sel.parsed.center}（${sel.parsed.ch}）` },
                      { icon: User, l: "顧客名", v: sel.parsed.name },
                      { icon: Phone, l: "電話番号", v: sel.parsed.phone },
                      { icon: MapPin, l: "住所", v: sel.parsed.addr },
                      { icon: Calendar, l: "希望日時", v: `${sel.parsed.date} ${sel.parsed.time}` },
                      { icon: Package, l: "品目", v: sel.parsed.items },
                      { icon: FileText, l: "備考", v: sel.parsed.note || "なし" },
                    ].map(({ icon: II, l, v }) => (
                      <div key={l} className={cn("flex items-start gap-2.5 p-3 rounded-xl border",
                        v.includes("未記載") || v.includes("不明") || v.includes("⚠") ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100")}>
                        <II size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <div><p className="text-[10px] text-slate-400">{l}</p><p className="text-sm font-medium text-slate-700">{v}</p></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {sel.status === "pending" && (
                    <>
                      <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
                        <CheckCircle size={16} /> 案件として登録
                      </button>
                      <button className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50">
                        編集して登録
                      </button>
                    </>
                  )}
                  {sel.status === "error" && (
                    <button className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 flex items-center justify-center gap-2">
                      <FileText size={16} /> 手動で情報を補完
                    </button>
                  )}
                  {sel.status === "registered" && (
                    <div className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium text-center border border-emerald-200">
                      ✓ CS-0023 として登録済み
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">メッセージを選択してください</div>
          )}
        </Card>
      </div>
    </div>
  );
}
