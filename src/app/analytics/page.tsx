"use client";

import { Card } from "@/components/ui/card";
import { monthlyRevenue, weekData, adROIData } from "@/lib/mock-data";
import { cn, fmt } from "@/lib/utils";
import { Download, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">売上分析</h1>
          <p className="text-xs text-slate-400 mt-1">Googleスプレッドシートの集計を自動化</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Download size={16} /> エクスポート
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4">月次売上推移</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="an" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
              <Tooltip formatter={(value: number) => fmt(value)} />
              <Area type="monotone" dataKey="売上" stroke="#6366f1" fill="url(#an)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4">曜日別案件数</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip />
              <Bar dataKey="案件数" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100"><h3 className="font-bold text-slate-800">広告媒体別ROI</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["媒体名", "コスト", "案件数", "売上", "ROI", "CVR"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adROIData.map((a) => {
                const roi = a.cost > 0 ? (((a.rev - a.cost) / a.cost) * 100).toFixed(0) : "0";
                return (
                  <tr key={a.name} className="border-b border-slate-50 hover:bg-slate-50/80">
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">{a.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{fmt(a.cost)}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{a.cases}件</td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-800">{fmt(a.rev)}</td>
                    <td className="px-5 py-3"><span className={cn("text-sm font-bold", Number(roi) > 100 ? "text-emerald-600" : "text-amber-600")}>{roi}%</span></td>
                    <td className="px-5 py-3 text-sm text-slate-600">{a.cvr}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
