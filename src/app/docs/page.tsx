"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { cn, fmt } from "@/lib/utils";
import {
  Plus, FileText, ChevronLeft, ChevronRight, Check, X,
  Download, Send, BookOpen, Receipt, ArrowRight,
  Phone, MapPin, Calendar, User, Building2,
  Zap, Trash2, AlertTriangle,
} from "lucide-react";

// ─── 型 ──────────────────────────────────────────────────────────────────────
type InvStatus = "draft" | "sent" | "unpaid" | "overdue" | "paid" | "cancelled";
type EstStatus = "draft" | "sent" | "approved" | "rejected" | "expired";
type PayMethod = "bank" | "cash" | "credit";
type DocTab = "estimate" | "invoice" | "receipt";

interface DocItem   { name: string; qty: number; unit: string; price: number }
interface DocBase   { id: string; caseId: string; customer: string; phone: string; addr: string; issueDate: string; cat: string; items: DocItem[]; tax: number; note: string; staff: string }
interface Invoice   extends DocBase { status: InvStatus; dueDate: string; paidDate?: string }
interface Estimate  extends DocBase { status: EstStatus; expiryDate: string }
interface Receipt   extends DocBase { payMethod: PayMethod; invoiceId?: string }

// ─── ステータス定義 ───────────────────────────────────────────────────────────
const INV_STATUS: Record<InvStatus, { l: string; bg: string; text: string; dot: string }> = {
  draft:    { l: "下書き",   bg: "bg-slate-100",   text: "text-slate-600",   dot: "#94a3b8" },
  sent:     { l: "送付済み", bg: "bg-blue-100",    text: "text-blue-700",    dot: "#3b82f6" },
  unpaid:   { l: "未払い",   bg: "bg-amber-100",   text: "text-amber-700",   dot: "#f59e0b" },
  overdue:  { l: "期限超過", bg: "bg-red-100",     text: "text-red-700",     dot: "#ef4444" },
  paid:     { l: "支払済み", bg: "bg-emerald-100", text: "text-emerald-700", dot: "#10b981" },
  cancelled:{ l: "キャンセル",bg:"bg-slate-100",   text: "text-slate-400",   dot: "#cbd5e1" },
};
const EST_STATUS: Record<EstStatus, { l: string; bg: string; text: string }> = {
  draft:    { l: "下書き",   bg: "bg-slate-100",   text: "text-slate-600"   },
  sent:     { l: "送付済み", bg: "bg-blue-100",    text: "text-blue-700"    },
  approved: { l: "承認済み", bg: "bg-emerald-100", text: "text-emerald-700" },
  rejected: { l: "却下",     bg: "bg-red-100",     text: "text-red-700"     },
  expired:  { l: "期限切れ", bg: "bg-slate-100",   text: "text-slate-400"   },
};
const PAY_LABEL: Record<PayMethod, string> = { bank: "銀行振込", cash: "現金払い", credit: "クレジット" };

// ─── 会社情報 ─────────────────────────────────────────────────────────────────
const COMPANY = {
  name:  "株式会社 スマカレサービス",
  zip:   "〒150-0001",
  addr:  "東京都渋谷区神宮前3-1-1 スマカレビル5F",
  tel:   "03-1234-5678",
  email: "billing@sumakare.jp",
  bank:  "みずほ銀行 渋谷支店（普通） 1234567",
};

// ─── モックデータ ─────────────────────────────────────────────────────────────
const INVOICES_DATA: Invoice[] = [
  { id: "INV-2026-001", caseId: "CS-0023", status: "paid",    customer: "あかざわ たつゆき", phone: "090-6195-0960", addr: "神奈川県逗子市桜山5-39-16",        issueDate: "2026-02-01", dueDate: "2026-02-15", paidDate: "2026-02-10", cat: "不用品回収",       items: [{ name: "不用品回収作業費", qty: 1, unit: "式", price: 50000 }, { name: "トラック費用（2t）", qty: 1, unit: "台", price: 15000 }, { name: "追加料金", qty: 2, unit: "点", price: 5000 }], tax: 10, note: "当日作業完了。", staff: "田中" },
  { id: "INV-2026-002", caseId: "CS-0031", status: "unpaid",  customer: "ほり せいこ",       phone: "080-1234-5678", addr: "東京都世田谷区三軒茶屋2-15-8",     issueDate: "2026-02-05", dueDate: "2026-02-20",                         cat: "ハウスクリーニング", items: [{ name: "ハウスクリーニング（3LDK）", qty: 1, unit: "式", price: 85000 }, { name: "エアコン", qty: 2, unit: "台", price: 12000 }], tax: 10, note: "", staff: "佐藤" },
  { id: "INV-2026-003", caseId: "CS-0018", status: "overdue", customer: "すずき たろう",     phone: "070-9999-1234", addr: "千葉県船橋市本町4-23-1",            issueDate: "2026-01-20", dueDate: "2026-02-05",                         cat: "引っ越し",         items: [{ name: "引っ越し作業費", qty: 1, unit: "式", price: 120000 }, { name: "梱包資材", qty: 1, unit: "式", price: 8000 }], tax: 10, note: "2度目の催促済み", staff: "鈴木" },
  { id: "INV-2026-004", caseId: "CS-0045", status: "sent",    customer: "たなか はなこ",     phone: "090-5555-7890", addr: "東京都新宿区西新宿3-7-1",          issueDate: "2026-02-10", dueDate: "2026-02-28",                         cat: "不用品回収",       items: [{ name: "不用品回収", qty: 1, unit: "式", price: 35000 }], tax: 10, note: "", staff: "田中" },
  { id: "INV-2026-005", caseId: "CS-0052", status: "draft",   customer: "やまだ けんじ",     phone: "080-3333-4444", addr: "埼玉県さいたま市大宮区大門町2-45", issueDate: "2026-02-12", dueDate: "2026-03-01",                         cat: "不用品回収",       items: [{ name: "不用品回収作業費", qty: 1, unit: "式", price: 45000 }], tax: 10, note: "", staff: "高橋" },
];

const ESTIMATES_DATA: Estimate[] = [
  { id: "EST-2026-001", caseId: "CS-0061", status: "sent",    customer: "なかの みき",     phone: "090-1111-2222", addr: "東京都杉並区高円寺南3-28-5",     issueDate: "2026-02-08", expiryDate: "2026-03-08", cat: "不用品回収",  items: [{ name: "不用品回収作業費", qty: 1, unit: "式", price: 45000 }, { name: "トラック費用（2t）", qty: 1, unit: "台", price: 15000 }, { name: "スタッフ追加", qty: 1, unit: "式", price: 8000 }], tax: 10, note: "相見積もりあり。価格は要交渉。", staff: "田中" },
  { id: "EST-2026-002", caseId: "CS-0058", status: "approved",customer: "きむら としお",   phone: "080-7777-8888", addr: "神奈川県横浜市中区山手町45-8",   issueDate: "2026-02-03", expiryDate: "2026-03-03", cat: "引っ越し",   items: [{ name: "引っ越し作業費", qty: 1, unit: "式", price: 150000 }, { name: "エレベーターなし追加", qty: 3, unit: "階", price: 5000 }], tax: 10, note: "", staff: "佐藤" },
  { id: "EST-2026-003", caseId: "CS-0055", status: "draft",   customer: "おかだ ゆうこ",   phone: "070-2222-3333", addr: "東京都港区赤坂2-14-22",           issueDate: "2026-02-11", expiryDate: "2026-03-11", cat: "ハウスクリーニング", items: [{ name: "ハウスクリーニング（2LDK）", qty: 1, unit: "式", price: 65000 }], tax: 10, note: "", staff: "鈴木" },
  { id: "EST-2026-004", caseId: "CS-0049", status: "expired", customer: "わたなべ こうじ", phone: "090-4444-5555", addr: "千葉県市川市市川南2-9-12",         issueDate: "2026-01-15", expiryDate: "2026-02-15", cat: "不用品回収",  items: [{ name: "不用品回収作業費", qty: 1, unit: "式", price: 28000 }], tax: 10, note: "", staff: "田中" },
];

const RECEIPTS_DATA: Receipt[] = [
  { id: "RCP-2026-001", caseId: "CS-0023", customer: "あかざわ たつゆき", phone: "090-6195-0960", addr: "神奈川県逗子市桜山5-39-16",  issueDate: "2026-02-10", payMethod: "bank",  invoiceId: "INV-2026-001", cat: "不用品回収", items: [{ name: "不用品回収作業費", qty: 1, unit: "式", price: 50000 }, { name: "トラック費用（2t）", qty: 1, unit: "台", price: 15000 }, { name: "追加料金", qty: 2, unit: "点", price: 5000 }], tax: 10, note: "", staff: "田中" },
  { id: "RCP-2026-002", caseId: "CS-0039", customer: "いのうえ まさき",   phone: "080-6666-7777", addr: "東京都渋谷区道玄坂1-5-3",      issueDate: "2026-02-07", payMethod: "cash",  cat: "ハウスクリーニング",items: [{ name: "ハウスクリーニング（1K）", qty: 1, unit: "式", price: 22000 }], tax: 10, note: "", staff: "高橋" },
  { id: "RCP-2026-003", caseId: "CS-0012", customer: "まつだ りか",       phone: "090-8888-9999", addr: "埼玉県川越市仲町1-4",           issueDate: "2026-02-04", payMethod: "credit",cat: "引っ越し", items: [{ name: "引っ越し作業費", qty: 1, unit: "式", price: 85000 }], tax: 10, note: "", staff: "佐藤" },
];

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
function calcDoc(items: DocItem[], taxRate: number) {
  const sub = items.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
  const taxAmt = Math.round(sub * taxRate / 100);
  return { sub, taxAmt, total: sub + taxAmt };
}

// ─── 共有UI ──────────────────────────────────────────────────────────────────
function DocItemTable({ items, tax }: { items: DocItem[]; tax: number }) {
  const { sub, taxAmt, total } = calcDoc(items, tax);
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-sm min-w-[400px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">品目</th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500">数量</th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500">単位</th>
            <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500">単価</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500">小計</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((it, i) => (
            <tr key={i} className="hover:bg-slate-50/60">
              <td className="px-4 py-2.5 text-slate-800 font-medium">{it.name}</td>
              <td className="px-3 py-2.5 text-right text-slate-600">{it.qty}</td>
              <td className="px-3 py-2.5 text-right text-slate-500">{it.unit}</td>
              <td className="px-3 py-2.5 text-right text-slate-600">{fmt(it.price)}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-slate-800">{fmt(it.price * it.qty)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-slate-200 bg-slate-50/60">
          <tr>
            <td colSpan={4} className="px-4 py-2 text-right text-xs text-slate-500">小計</td>
            <td className="px-4 py-2 text-right text-sm text-slate-700">{fmt(sub)}</td>
          </tr>
          <tr>
            <td colSpan={4} className="px-4 py-1 text-right text-xs text-slate-500">消費税（{tax}%）</td>
            <td className="px-4 py-1 text-right text-sm text-slate-700">{fmt(taxAmt)}</td>
          </tr>
          <tr>
            <td colSpan={4} className="px-4 py-2.5 text-right text-sm font-bold text-slate-800">合計（税込）</td>
            <td className="px-4 py-2.5 text-right text-base font-black text-indigo-700">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── 見積書 ───────────────────────────────────────────────────────────────────
function EstimateList({ estimates, onSelect, onCreate }: {
  estimates: Estimate[]; onSelect: (e: Estimate) => void; onCreate: () => void;
}) {
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState<EstStatus | "all">("all");
  const filtered = estimates.filter(e =>
    (sf === "all" || e.status === sf) &&
    (!search || e.customer.includes(search) || e.id.includes(search))
  );
  const kpis = [
    { l: "見積書総数", v: `${estimates.length}件`, color: "text-emerald-600", bg: "bg-emerald-50" },
    { l: "承認済み",   v: `${estimates.filter(e => e.status === "approved").length}件`, color: "text-indigo-600", bg: "bg-indigo-50" },
    { l: "送付済み",   v: `${estimates.filter(e => e.status === "sent").length}件`, color: "text-blue-600", bg: "bg-blue-50" },
    { l: "期限切れ",   v: `${estimates.filter(e => e.status === "expired").length}件`, color: "text-red-500", bg: "bg-red-50" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {kpis.map((k) => (
          <div key={k.l} className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200/60 rounded-xl shadow-sm">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", k.bg)}>
              <BookOpen size={14} className={k.color} />
            </div>
            <div className="min-w-0">
              <p className={cn("text-sm font-bold leading-tight", k.color)}>{k.v}</p>
              <p className="text-[10px] text-slate-400 truncate">{k.l}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm"><SearchInput value={search} onChange={setSearch} placeholder="顧客名・見積書番号で検索..." /></div>
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap">
          <Plus size={15} /> 見積書を作成
        </button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([["all","すべて"],["draft","下書き"],["sent","送付済み"],["approved","承認済み"],["rejected","却下"],["expired","期限切れ"]] as [EstStatus|"all",string][]).map(([k,l]) => (
          <button key={k} onClick={() => setSf(k)} className={cn(
            "shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all",
            sf === k ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
          )}>{l}</button>
        ))}
      </div>
      <Card glass={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["見積書番号","顧客名","サービス","発行日","有効期限","金額","ステータス",""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const { total } = calcDoc(e.items, e.tax);
                const st = EST_STATUS[e.status];
                return (
                  <tr key={e.id} onClick={() => onSelect(e)} className="border-b border-slate-50 hover:bg-emerald-50/20 transition-colors cursor-pointer group">
                    <td className="px-4 py-3.5"><span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{e.id}</span></td>
                    <td className="px-4 py-3.5"><div className="text-sm font-semibold text-slate-800">{e.customer}</div><div className="text-xs text-slate-400">{e.caseId}</div></td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{e.cat}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{e.issueDate}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{e.expiryDate}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-800">{fmt(total)}</td>
                    <td className="px-4 py-3.5"><span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", st.bg, st.text)}>{st.l}</span></td>
                    <td className="px-4 py-3.5"><ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* モバイル */}
        <div className="divide-y divide-slate-100 lg:hidden">
          {filtered.map((e) => {
            const { total } = calcDoc(e.items, e.tax);
            return (
              <div key={e.id} onClick={() => onSelect(e)} className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono text-emerald-600 font-semibold">{e.id}</span>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{e.customer}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{e.cat} · {e.issueDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">{fmt(total)}</div>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", EST_STATUS[e.status].bg, EST_STATUS[e.status].text)}>{EST_STATUS[e.status].l}</span>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function EstimatePreview({ estimate, onBack }: { estimate: Estimate; onBack: () => void }) {
  const { sub, taxAmt, total } = calcDoc(estimate.items, estimate.tax);
  const st = EST_STATUS[estimate.status];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium"><ChevronLeft size={16} /> 一覧に戻る</button>
        <span className={cn("text-sm font-semibold px-3 py-1.5 rounded-full", st.bg, st.text)}>{st.l}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors"><Download size={15} /> PDF出力</button>
        <button className="flex items-center gap-2 px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"><Send size={15} /> メール送付</button>
        {estimate.status === "approved" && (
          <button className="flex items-center gap-2 px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"><FileText size={15} /> 請求書を作成</button>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-white">
          <div className="flex justify-between items-start">
            <div><h1 className="text-2xl font-black tracking-tight">見 積 書</h1><p className="text-emerald-100 mt-1 text-sm">{COMPANY.name}</p></div>
            <div className="text-right text-sm text-emerald-100"><p>見積書 No. {estimate.id}</p><p className="mt-1">発行日: {estimate.issueDate}</p><p>有効期限: {estimate.expiryDate}</p></div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">宛先</p>
              <p className="text-lg font-bold text-slate-900">{estimate.customer} 様</p>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1"><Phone size={12} />{estimate.phone}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={12} />{estimate.addr}</p>
            </div>
            <div className="text-right space-y-1">
              {([["発行者", COMPANY.name], ["住所", COMPANY.addr], ["TEL", COMPANY.tel], ["メール", COMPANY.email]] as [string, string][]).map(([l, v]) => (
                <div key={l} className="flex items-start gap-4 justify-end">
                  <span className="text-xs text-slate-400 w-12 text-right shrink-0">{l}</span>
                  <span className="text-xs text-slate-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-5">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">お見積金額</p>
            <p className="text-4xl font-black text-emerald-800">{fmt(total)} <span className="text-sm font-normal text-emerald-600">（税込）</span></p>
          </div>
          <DocItemTable items={estimate.items} tax={estimate.tax} />
          {estimate.note && (
            <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">備考</p><div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700">{estimate.note}</div></div>
          )}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
            <p>本見積書の有効期限は発行日より30日間です。ご不明な点はお気軽にお問い合わせください。</p>
            <p className="mt-1">{COMPANY.name} / {COMPANY.tel} / {COMPANY.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EstimateForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const today = new Date().toISOString().slice(0, 10);
  const expiry = (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10); })();
  const [form, setForm] = useState({ caseId: "", customer: "", phone: "", addr: "", cat: "不用品回収", issueDate: today, expiryDate: expiry, paymentMethod: "bank", note: "", items: [{ name: "", qty: 1, unit: "式", price: 0 }], tax: 10 });
  const [autoFilled, setAutoFilled] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { name: "", qty: 1, unit: "式", price: 0 }] }));
  const removeItem = (i: number) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const setItem = (i: number, k: keyof DocItem, v: string | number) => setForm((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));
  const { sub, taxAmt, total } = calcDoc(form.items, form.tax);
  const inputCls = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400";

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><ChevronLeft size={20} className="text-slate-600" /></button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-800">見積書を作成</h2>
          <p className="text-xs text-slate-400">ステップ {step} / 3</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all", step > s ? "bg-emerald-500 text-white" : step === s ? "bg-emerald-600 text-white shadow shadow-emerald-300" : "bg-slate-100 text-slate-400")}>
                {step > s ? <Check size={12} /> : s}
              </div>
              {s < 3 && <div className={cn("w-8 h-0.5 rounded-full", step > s ? "bg-emerald-400" : "bg-slate-200")} />}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="p-2 bg-emerald-100 rounded-lg"><Zap size={15} className="text-emerald-600" /></div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-emerald-800">案件から自動入力</p>
              <input value={form.caseId} onChange={(e) => set("caseId", e.target.value)} placeholder="例: CS-0061" className="mt-1 w-full text-sm bg-white border border-emerald-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <button onClick={() => { set("customer", "なかの みき"); set("phone", "090-1111-2222"); set("addr", "東京都杉並区高円寺南3-28-5"); set("items", [{ name: "不用品回収作業費", qty: 1, unit: "式", price: 45000 }, { name: "トラック費用（2t）", qty: 1, unit: "台", price: 15000 }]); setAutoFilled(true); }} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 whitespace-nowrap">取得</button>
          </div>
          {autoFilled && <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2"><Check size={12} />案件データを自動入力しました</div>}
          {[{ l: "顧客名", k: "customer" as const, req: true }, { l: "電話番号", k: "phone" as const, type: "tel" }, { l: "住所", k: "addr" as const }].map((f) => (
            <div key={f.k}><label className="text-xs font-semibold text-slate-600 block mb-1">{f.l}{f.req && <span className="text-red-400 ml-0.5">*</span>}</label><input type={f.type ?? "text"} value={form[f.k]} onChange={(e) => set(f.k, e.target.value)} className={inputCls} /></div>
          ))}
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">サービスカテゴリ</label>
            <select value={form.cat} onChange={(e) => set("cat", e.target.value)} className={inputCls}>
              {["不用品回収","引っ越し","ハウスクリーニング","遺品整理","その他"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">発行日</label><input type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} className={inputCls} /></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">有効期限</label><input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} className={inputCls} /></div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-slate-800">品目入力</p>
            <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100"><Plus size={13} />追加</button>
          </div>
          {form.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_50px_80px_32px] gap-2 items-center">
              <input value={it.name} onChange={(e) => setItem(i, "name", e.target.value)} placeholder="品目名" className={cn(inputCls, "col-span-1")} />
              <input type="number" value={it.qty} onChange={(e) => setItem(i, "qty", Number(e.target.value))} className={cn(inputCls, "text-center")} />
              <input value={it.unit} onChange={(e) => setItem(i, "unit", e.target.value)} className={inputCls} />
              <input type="number" value={it.price} onChange={(e) => setItem(i, "price", Number(e.target.value))} className={inputCls} />
              <button onClick={() => removeItem(i)} className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center transition-colors"><Trash2 size={13} className="text-red-400" /></button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">消費税率</label>
              <select value={form.tax} onChange={(e) => set("tax", Number(e.target.value))} className={inputCls}><option value={10}>10%</option><option value={8}>8%（軽減）</option><option value={0}>0%（非課税）</option></select>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1 text-sm">
            <div className="flex justify-between text-slate-600"><span>小計</span><span>{fmt(sub)}</span></div>
            <div className="flex justify-between text-slate-600"><span>消費税（{form.tax}%）</span><span>{fmt(taxAmt)}</span></div>
            <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-200 mt-1"><span>合計</span><span>{fmt(total)}</span></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">備考</label><textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={3} className={cn(inputCls, "resize-none")} placeholder="特記事項..." /></div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-5 space-y-4">
          <p className="text-sm font-semibold text-slate-700">確認して発行</p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 text-center">
            <p className="text-xs text-emerald-600 font-semibold mb-1">お見積金額</p>
            <p className="text-3xl font-black text-emerald-800">{fmt(total)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["顧客名", form.customer], ["電話", form.phone], ["住所", form.addr], ["カテゴリ", form.cat], ["発行日", form.issueDate], ["有効期限", form.expiryDate]].map(([l, v]) => (
              <div key={l} className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">{l}</p><p className="font-medium text-slate-800 mt-0.5">{v || "—"}</p></div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        {step > 1 && <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50">戻る</button>}
        {step < 3
          ? <button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !form.customer.trim()} className={cn("flex-1 py-3 rounded-2xl font-semibold text-sm transition-all", form.customer.trim() || step > 1 ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md" : "bg-slate-100 text-slate-400 cursor-not-allowed")}>次へ</button>
          : <button onClick={onBack} className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2"><Check size={16} />見積書を発行する</button>
        }
      </div>
    </div>
  );
}

// ─── 請求書 ───────────────────────────────────────────────────────────────────
function InvoiceList({ invoices, onSelect, onCreate }: { invoices: Invoice[]; onSelect: (i: Invoice) => void; onCreate: () => void }) {
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState<InvStatus | "all">("all");
  const filtered = invoices.filter(i => (sf === "all" || i.status === sf) && (!search || i.customer.includes(search) || i.id.includes(search)));
  const unpaidTotal = invoices.filter(i => i.status === "unpaid" || i.status === "overdue").reduce((s, i) => s + calcDoc(i.items, i.tax).total, 0);
  const paidTotal   = invoices.filter(i => i.status === "paid").reduce((s, i) => s + calcDoc(i.items, i.tax).total, 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;
  const kpis = [
    { l: "未回収合計", v: fmt(unpaidTotal), color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle },
    { l: "回収済み",   v: fmt(paidTotal),   color: "text-emerald-600", bg: "bg-emerald-50", icon: Check },
    { l: "期限超過",   v: `${overdueCount}件`, color: "text-red-500", bg: "bg-red-50", icon: AlertTriangle },
    { l: "合計件数",   v: `${invoices.length}件`, color: "text-indigo-600", bg: "bg-indigo-50", icon: FileText },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {kpis.map((k) => (
          <div key={k.l} className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200/60 rounded-xl shadow-sm">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", k.bg)}><k.icon size={13} className={k.color} /></div>
            <div className="min-w-0"><p className={cn("text-sm font-bold leading-tight", k.color)}>{k.v}</p><p className="text-[10px] text-slate-400 truncate">{k.l}</p></div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm"><SearchInput value={search} onChange={setSearch} placeholder="顧客名・請求書番号で検索..." /></div>
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-colors whitespace-nowrap"><Plus size={15} />請求書を作成</button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {([["all","すべて"],["draft","下書き"],["sent","送付済み"],["unpaid","未払い"],["overdue","期限超過"],["paid","支払済み"],["cancelled","キャンセル"]] as [InvStatus|"all",string][]).map(([k,l]) => (
          <button key={k} onClick={() => setSf(k)} className={cn("shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all", sf === k ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>{l}</button>
        ))}
      </div>
      <Card glass={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="border-b border-slate-100 bg-slate-50/60">{["請求書番号","顧客名","サービス","発行日","支払期日","金額","ステータス",""].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((inv) => {
                const { total } = calcDoc(inv.items, inv.tax);
                const st = INV_STATUS[inv.status];
                return (
                  <tr key={inv.id} onClick={() => onSelect(inv)} className="border-b border-slate-50 hover:bg-indigo-50/20 transition-colors cursor-pointer group">
                    <td className="px-4 py-3.5"><span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{inv.id}</span></td>
                    <td className="px-4 py-3.5"><div className="text-sm font-semibold text-slate-800">{inv.customer}</div><div className="text-xs text-slate-400">{inv.caseId}</div></td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{inv.cat}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{inv.issueDate}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{inv.dueDate}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-800">{fmt(total)}</td>
                    <td className="px-4 py-3.5"><span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", st.bg, st.text)}>{st.l}</span></td>
                    <td className="px-4 py-3.5"><ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-slate-100 lg:hidden">
          {filtered.map((inv) => { const { total } = calcDoc(inv.items, inv.tax); return (
            <div key={inv.id} onClick={() => onSelect(inv)} className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 cursor-pointer">
              <div className="flex-1 min-w-0"><span className="text-xs font-mono text-indigo-600 font-semibold">{inv.id}</span><div className="text-sm font-semibold text-slate-800 mt-0.5">{inv.customer}</div><div className="text-xs text-slate-400">{inv.cat} · {inv.dueDate}期限</div></div>
              <div className="text-right"><div className="text-sm font-bold">{fmt(total)}</div><span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", INV_STATUS[inv.status].bg, INV_STATUS[inv.status].text)}>{INV_STATUS[inv.status].l}</span></div>
              <ChevronRight size={16} className="text-slate-300 shrink-0" />
            </div>
          ); })}
        </div>
      </Card>
    </div>
  );
}

function InvoicePreview({ invoice, onBack }: { invoice: Invoice; onBack: () => void }) {
  const { sub, taxAmt, total } = calcDoc(invoice.items, invoice.tax);
  const st = INV_STATUS[invoice.status];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium"><ChevronLeft size={16} /> 一覧に戻る</button>
        <span className={cn("text-sm font-semibold px-3 py-1.5 rounded-full", st.bg, st.text)}>{st.l}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-colors"><Download size={15} /> PDF出力</button>
        <button className="flex items-center gap-2 px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"><Send size={15} /> メール送付</button>
        {invoice.status === "paid" && <button className="flex items-center gap-2 px-4 py-2 border border-violet-200 bg-violet-50 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-100 transition-colors"><Receipt size={15} /> 領収書を発行</button>}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 text-white">
          <div className="flex justify-between items-start">
            <div><h1 className="text-2xl font-black tracking-tight">請 求 書</h1><p className="text-indigo-200 mt-1 text-sm">{COMPANY.name}</p></div>
            <div className="text-right text-sm text-indigo-200"><p>請求書 No. {invoice.id}</p><p className="mt-1">発行日: {invoice.issueDate}</p><p>お支払期日: {invoice.dueDate}</p>{invoice.paidDate && <p className="text-emerald-300 font-semibold mt-1">入金日: {invoice.paidDate}</p>}</div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">宛先</p>
              <p className="text-lg font-bold text-slate-900">{invoice.customer} 様</p>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1"><Phone size={12} />{invoice.phone}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin size={12} />{invoice.addr}</p>
            </div>
            <div className="text-right space-y-1">
              {([["発行者", COMPANY.name], ["住所", COMPANY.addr], ["TEL", COMPANY.tel], ["振込先", COMPANY.bank]] as [string, string][]).map(([l, v]) => (
                <div key={l} className="flex items-start gap-4 justify-end"><span className="text-xs text-slate-400 w-14 text-right shrink-0">{l}</span><span className="text-xs text-slate-700">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-5">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">ご請求金額</p>
            <p className="text-4xl font-black text-indigo-800">{fmt(total)} <span className="text-sm font-normal text-indigo-600">（税込）</span></p>
          </div>
          <DocItemTable items={invoice.items} tax={invoice.tax} />
          {invoice.note && (<div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">備考</p><div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700">{invoice.note}</div></div>)}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400"><p>お支払いは上記期日までにお願いいたします。ご不明な点はお気軽にお問い合わせください。</p><p className="mt-1">{COMPANY.name} / {COMPANY.tel} / {COMPANY.email}</p></div>
        </div>
      </div>
    </div>
  );
}

// ─── 領収書 ───────────────────────────────────────────────────────────────────
function ReceiptList({ receipts, onSelect, onCreate, paidInvoiceCount }: { receipts: Receipt[]; onSelect: (r: Receipt) => void; onCreate: () => void; paidInvoiceCount: number }) {
  const [search, setSearch] = useState("");
  const filtered = receipts.filter(r => !search || r.customer.includes(search) || r.id.includes(search));
  const totalIssued = receipts.reduce((s, r) => s + calcDoc(r.items, r.tax).total, 0);
  const kpis = [
    { l: "発行済み領収書", v: `${receipts.length}件`, color: "text-violet-600", bg: "bg-violet-50" },
    { l: "領収総額", v: fmt(totalIssued), color: "text-emerald-600", bg: "bg-emerald-50" },
    { l: "現金領収", v: `${receipts.filter(r => r.payMethod === "cash").length}件`, color: "text-amber-600", bg: "bg-amber-50" },
    { l: "振込領収", v: `${receipts.filter(r => r.payMethod === "bank").length}件`, color: "text-blue-600", bg: "bg-blue-50" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {kpis.map((k) => (
          <div key={k.l} className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200/60 rounded-xl shadow-sm">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", k.bg)}><Receipt size={13} className={k.color} /></div>
            <div className="min-w-0"><p className={cn("text-sm font-bold leading-tight", k.color)}>{k.v}</p><p className="text-[10px] text-slate-400 truncate">{k.l}</p></div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-sm"><SearchInput value={search} onChange={setSearch} placeholder="顧客名・領収書番号で検索..." /></div>
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 shadow-sm transition-colors whitespace-nowrap"><Plus size={15} />領収書を発行</button>
      </div>
      {paidInvoiceCount > 0 && (
        <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0"><Zap size={15} className="text-violet-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-violet-900">入金済み請求書から自動発行</p>
            <p className="text-xs text-violet-700 mt-0.5">請求書ステータスが「支払済み」になると、領収書を1クリックで自動生成できます。</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-xs text-emerald-600 font-medium">{paidInvoiceCount}件 発行可能</span></div>
        </div>
      )}
      <Card glass={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead><tr className="border-b border-slate-100 bg-slate-50/60">{["領収書番号","顧客名","サービス","発行日","支払方法","金額","請求書連番",""].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((rec) => {
                const { total } = calcDoc(rec.items, rec.tax);
                return (
                  <tr key={rec.id} onClick={() => onSelect(rec)} className="border-b border-slate-50 hover:bg-violet-50/20 transition-colors cursor-pointer group">
                    <td className="px-4 py-3.5"><span className="text-xs font-mono font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">{rec.id}</span></td>
                    <td className="px-4 py-3.5"><div className="text-sm font-semibold text-slate-800">{rec.customer}</div><div className="text-xs text-slate-400">{rec.caseId}</div></td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{rec.cat}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{rec.issueDate}</td>
                    <td className="px-4 py-3.5"><span className={cn("text-xs font-medium px-2 py-1 rounded-full", rec.payMethod === "cash" ? "bg-amber-100 text-amber-700" : rec.payMethod === "bank" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>{PAY_LABEL[rec.payMethod]}</span></td>
                    <td className="px-4 py-3.5 text-sm font-bold text-slate-800">{fmt(total)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">{rec.invoiceId ?? "—"}</td>
                    <td className="px-4 py-3.5"><ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-slate-100 lg:hidden">
          {filtered.map((rec) => { const { total } = calcDoc(rec.items, rec.tax); return (
            <div key={rec.id} onClick={() => onSelect(rec)} className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 cursor-pointer">
              <div className="flex-1 min-w-0"><span className="text-xs font-mono text-violet-600 font-semibold">{rec.id}</span><div className="text-sm font-semibold text-slate-800 mt-0.5">{rec.customer}</div><div className="text-xs text-slate-400">{rec.cat} · {rec.issueDate}</div></div>
              <div className="text-right"><div className="text-sm font-bold">{fmt(total)}</div><p className="text-xs text-slate-400">{PAY_LABEL[rec.payMethod]}</p></div>
              <ChevronRight size={16} className="text-slate-300 shrink-0" />
            </div>
          ); })}
        </div>
      </Card>
    </div>
  );
}

function ReceiptPreview({ receipt, onBack }: { receipt: Receipt; onBack: () => void }) {
  const { total } = calcDoc(receipt.items, receipt.tax);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium"><ChevronLeft size={16} /> 一覧に戻る</button>
        <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">発行済み</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 shadow-sm transition-colors"><Download size={15} /> PDF出力</button>
        <button className="flex items-center gap-2 px-4 py-2 border border-violet-200 bg-violet-50 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-100 transition-colors"><Send size={15} /> メール送付</button>
        {receipt.invoiceId && <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-600 font-medium"><FileText size={13} />{receipt.invoiceId} の請求書</div>}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex justify-between items-start">
            <div><h1 className="text-2xl font-black tracking-tight">領 収 書</h1><p className="text-violet-200 mt-1 text-sm">{COMPANY.name}</p></div>
            <div className="text-right text-sm text-violet-200"><p>領収書 No. {receipt.id}</p><p className="mt-1">発行日: {receipt.issueDate}</p></div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="text-center py-8 mb-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">領収金額</p>
            <p className="text-5xl font-black text-slate-900 tracking-tight">{fmt(total)}</p>
            <p className="text-sm text-slate-500 mt-2">消費税（{receipt.tax}%）含む</p>
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
              <Check size={13} className="text-emerald-600" /><span className="text-sm text-emerald-700 font-semibold">確かに領収いたしました</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">お支払者</p>
              <p className="text-lg font-bold text-slate-900">{receipt.customer} 様</p>
              <p className="text-sm text-slate-500 mt-0.5">{receipt.phone}</p>
            </div>
            <div className="text-right space-y-1">
              {([["発行日", receipt.issueDate], ["支払方法", PAY_LABEL[receipt.payMethod]], ["対応案件", receipt.caseId], ["担当", receipt.staff]] as [string, string][]).map(([l, v]) => (
                <div key={l} className="flex items-center gap-6 justify-end"><span className="text-xs text-slate-400 w-20 text-right">{l}</span><span className="text-sm font-semibold text-slate-800 w-32 text-right">{v}</span></div>
              ))}
            </div>
          </div>
          <DocItemTable items={receipt.items} tax={receipt.tax} />
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-end justify-between">
            <div className="text-xs text-slate-400"><p>上記の金額正に領収いたしました。</p><p className="mt-0.5">{COMPANY.name} / {COMPANY.tel}</p></div>
            <div className="text-right"><p className="text-sm font-bold text-slate-800">{COMPANY.name}</p><div className="w-14 h-14 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mt-2 ml-auto"><span className="text-[10px] text-slate-300">印</span></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── メインページ ─────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [tab, setTab] = useState<DocTab>("estimate");
  const [estView, setEstView]     = useState<"list"|"detail"|"form">("list");
  const [invView, setInvView]     = useState<"list"|"detail"|"form">("list");
  const [recView, setRecView]     = useState<"list"|"detail"|"form">("list");
  const [selEst, setSelEst]       = useState<Estimate | null>(null);
  const [selInv, setSelInv]       = useState<Invoice | null>(null);
  const [selRec, setSelRec]       = useState<Receipt | null>(null);
  const [estimates]  = useState(ESTIMATES_DATA);
  const [invoices]   = useState(INVOICES_DATA);
  const [receipts]   = useState(RECEIPTS_DATA);

  const paidInvCount = useMemo(() => invoices.filter(i => i.status === "paid").length, [invoices]);

  const FLOW = [
    { id: "estimate" as DocTab, l: "見積書", icon: BookOpen,  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "訪問見積後に作成・送付" },
    { id: "invoice"  as DocTab, l: "請求書", icon: FileText,  color: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-200",  desc: "承認後に発行・入金管理" },
    { id: "receipt"  as DocTab, l: "領収書", icon: Receipt,   color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200",  desc: "入金確認後に自動発行" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 書類フロー ナビ */}
      <div className="grid grid-cols-3 gap-2 lg:flex lg:items-center lg:gap-2">
        {FLOW.map((f, i) => (
          <div key={f.id} className="lg:flex lg:items-center lg:gap-2 contents lg:block">
            {/* モバイル */}
            <button onClick={() => setTab(f.id)} className={cn("lg:hidden flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all w-full", tab === f.id ? `${f.bg} ${f.border} shadow-sm` : "bg-white border-slate-100")}>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", tab === f.id ? f.bg : "bg-slate-100")}>
                <f.icon size={18} className={tab === f.id ? f.color : "text-slate-400"} />
              </div>
              <p className={cn("text-xs font-bold", tab === f.id ? f.color : "text-slate-600")}>{f.l}</p>
            </button>
            {/* デスクトップ */}
            <button onClick={() => setTab(f.id)} className={cn("hidden lg:flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 transition-all shrink-0", tab === f.id ? `${f.bg} ${f.border} shadow-sm` : "bg-white border-slate-100 hover:border-slate-200")}>
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", tab === f.id ? f.bg : "bg-slate-100")}>
                <f.icon size={16} className={tab === f.id ? f.color : "text-slate-400"} />
              </div>
              <div className="text-left">
                <p className={cn("text-sm font-bold", tab === f.id ? f.color : "text-slate-600")}>{f.l}</p>
                <p className={cn("text-[10px]", tab === f.id ? f.color + " opacity-70" : "text-slate-400")}>{f.desc}</p>
              </div>
            </button>
            {i < FLOW.length - 1 && <div className="hidden lg:flex items-center gap-1 shrink-0 text-slate-300"><div className="w-4 h-0.5 bg-slate-200" /><ArrowRight size={12} /><div className="w-4 h-0.5 bg-slate-200" /></div>}
          </div>
        ))}
      </div>

      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{FLOW.find(f => f.id === tab)?.l}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{FLOW.find(f => f.id === tab)?.desc}</p>
      </div>

      {/* 見積書 */}
      {tab === "estimate" && (
        estView === "form" ? <EstimateForm onBack={() => setEstView("list")} />
        : estView === "detail" && selEst ? <EstimatePreview estimate={selEst} onBack={() => { setEstView("list"); setSelEst(null); }} />
        : <EstimateList estimates={estimates} onSelect={(e) => { setSelEst(e); setEstView("detail"); }} onCreate={() => setEstView("form")} />
      )}

      {/* 請求書 */}
      {tab === "invoice" && (
        invView === "detail" && selInv ? <InvoicePreview invoice={selInv} onBack={() => { setInvView("list"); setSelInv(null); }} />
        : <InvoiceList invoices={invoices} onSelect={(i) => { setSelInv(i); setInvView("detail"); }} onCreate={() => {}} />
      )}

      {/* 領収書 */}
      {tab === "receipt" && (
        recView === "detail" && selRec ? <ReceiptPreview receipt={selRec} onBack={() => { setRecView("list"); setSelRec(null); }} />
        : <ReceiptList receipts={receipts} onSelect={(r) => { setSelRec(r); setRecView("detail"); }} onCreate={() => {}} paidInvoiceCount={paidInvCount} />
      )}
    </div>
  );
}
