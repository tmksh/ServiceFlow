"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageSquare, Bell, Building, Eye } from "lucide-react";

const sections = [
  {
    t: "LINE連携設定", icon: MessageSquare, items: [
      { l: "LINE Messaging APIトークン", v: "lk_*****...abc", tp: "secret" as const },
      { l: "Webhook URL", v: "https://api.serviceflow.jp/webhook/line", tp: "text" as const },
      { l: "自動取込", v: true, tp: "toggle" as const },
      { l: "緊急案件の自動振り分け", v: true, tp: "toggle" as const },
    ],
  },
  {
    t: "通知設定", icon: Bell, items: [
      { l: "新規案件通知", v: true, tp: "toggle" as const },
      { l: "キャンセル通知", v: true, tp: "toggle" as const },
      { l: "当日リマインダー", v: true, tp: "toggle" as const },
      { l: "日次レポート自動送信", v: false, tp: "toggle" as const },
    ],
  },
  {
    t: "会社情報", icon: Building, items: [
      { l: "会社名", v: "株式会社サンプル", tp: "text" as const },
      { l: "対応エリア", v: "関東・東海・関西", tp: "text" as const },
      { l: "スタッフ数", v: "12名", tp: "text" as const },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900">設定</h1></div>
      {sections.map((s) => (
        <Card key={s.t} className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-slate-100 rounded-xl"><s.icon size={20} className="text-slate-600" /></div>
            <h3 className="font-bold text-slate-800">{s.t}</h3>
          </div>
          <div className="space-y-4">
            {s.items.map((item) => (
              <div key={item.l} className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">{item.l}</span>
                {item.tp === "toggle" ? (
                  <div className={cn("relative w-11 h-6 rounded-full cursor-pointer", item.v ? "bg-indigo-600" : "bg-slate-300")}>
                    <div className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", item.v ? "translate-x-5" : "translate-x-0.5")} />
                  </div>
                ) : item.tp === "secret" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg">{item.v as string}</span>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100"><Eye size={16} className="text-slate-400" /></button>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg">{item.v as string}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
