import type { Case, CaseStatus, LineMessage, Settlement, Notification, Platform, LP } from "@/types";
import { CATEGORIES } from "./constants";
import { rnd } from "./utils";

const PREFS = ["東京都", "神奈川県", "埼玉県", "千葉県", "大阪府", "愛知県", "福岡県", "北海道", "京都府", "兵庫県"];
const CENTERS = ["ネコ", "わん"];
const CHANNELS = ["受電", "LINE", "Web"] as const;
const STAFF = ["田中", "佐藤", "鈴木", "高橋", "渡辺", "伊藤", "山本", "中村"];
const AD_SRC = ["Google広告", "Yahoo!広告", "Instagram", "LINE広告", "口コミ", "紹介", "チラシ"];
const NAMES = [
  "あかざわ たつゆき", "ほり せいこ", "むらた けんじ", "たきざわ ゆうこ",
  "かわしま りょう", "いしま たける", "よしだ あきら", "みすぎ はるか",
  "あんどう つよし", "さとう めぐみ", "おおた しんいち", "なかの みき",
  "やまだ こうへい", "まつもと さやか", "きむら だいすけ", "はやし のぞみ",
  "さいとう ゆうた", "しみず あい", "もりもと りな", "いけだ そうた",
];
const ITEMS_LIST = [
  "ベッドフレーム", "マットレス", "布団", "冷蔵庫", "洗濯機",
  "テレビ", "エアコン", "掃除機", "電子レンジ", "ソファ",
  "テーブル", "衣装ケース", "食器棚", "タンス", "自転車",
];

function generateCases(count: number): Case[] {
  const stKeys: CaseStatus[] = ["new", "estimate", "confirmed", "inProgress", "completed", "cancelled"];
  const now = new Date(2026, 1, 13);
  const arr: Case[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - rnd(0, 60));
    const cat = CATEGORIES[rnd(0, 5)];
    const st = stKeys[rnd(0, 5)];
    const amt = rnd(15000, 250000);
    const payMethod = st === "cancelled" ? null : rnd(0, 9) > 5 ? "credit" as const : "cash" as const;

    arr.push({
      id: `CS-${String(10000 + i).slice(1)}`,
      customer: NAMES[rnd(0, 19)],
      phone: `0${rnd(7, 9)}0-${String(rnd(1000, 9999))}-${String(rnd(1000, 9999))}`,
      postal: `${rnd(100, 999)}-${String(rnd(0, 9999)).padStart(4, "0")}`,
      category: cat,
      status: st,
      pref: PREFS[rnd(0, 9)],
      addr: `${PREFS[rnd(0, 9)]}○○市△△町${rnd(1, 10)}-${rnd(1, 30)}`,
      date: d.toISOString().split("T")[0],
      time: `${String(rnd(8, 18)).padStart(2, "0")}:${rnd(0, 1) === 0 ? "00" : "30"}`,
      amount: st === "cancelled" ? 0 : amt,
      source: AD_SRC[rnd(0, 6)],
      center: CENTERS[rnd(0, 1)],
      channel: CHANNELS[rnd(0, 2)],
      staff: STAFF[rnd(0, 7)],
      items: Array.from({ length: rnd(2, 6) }, () => ITEMS_LIST[rnd(0, 14)]),
      payMethod,
      urgent: rnd(0, 99) > 84,
      lineAuto: rnd(0, 1) === 1,
    });
  }

  return arr.sort((a, b) => b.date.localeCompare(a.date));
}

export const CASES = generateCases(200);

export const LINE_MSGS: LineMessage[] = [
  {
    id: 1, center: "ネコ", group: "神奈川案件", time: "10:23", status: "pending",
    raw: "神奈川　ネコ　受電　滝沢\nあかざわ　たつゆき\n〒248-0005\n神奈川県逗子市桜山5-39-16\n桜山ハイム麗生206号室\n090-6195-0960\n2/17　9-12時\n現場のみ\nベッドフレーム、マットレス、布団2組\nパック+初回費用\n0217",
    parsed: { pref: "神奈川県", center: "ネコ", ch: "受電", op: "滝沢", name: "あかざわ たつゆき", postal: "248-0005", addr: "神奈川県逗子市桜山5-39-16 桜山ハイム麗生206号室", phone: "090-6195-0960", date: "2/17", time: "9-12時", items: "ベッドフレーム、マットレス他5品", note: "パック+初回費用 / 相見積もり" },
  },
  {
    id: 2, center: "ネコ", group: "神奈川案件", time: "10:45", status: "registered",
    raw: "神奈川　ネコ　LINE　伴\nほり　せいこ\n〒227-0048\n神奈川県横浜市青葉区柿の木台5-13\nモナリエ101\n080-3040-4203\n2/12　10〜12時\n洗濯機と冷蔵庫とベッドフレーム",
    parsed: { pref: "神奈川県", center: "ネコ", ch: "LINE", op: "伴", name: "ほり せいこ", postal: "227-0048", addr: "神奈川県横浜市青葉区柿の木台5-13 モナリエ101", phone: "080-3040-4203", date: "2/12", time: "10〜12時", items: "洗濯機、冷蔵庫、ベッドフレーム", note: "見積→作業 / S又はMパック" },
  },
  {
    id: 3, center: "わん", group: "東京案件", time: "11:02", status: "pending",
    raw: "東京　わん　受電　山田\nおおた　しんいち\n〒160-0023\n東京都新宿区西新宿1-2-3\nグランドタワー1505\n090-1234-5678\n2/14　14-16時\n緊急・当日希望\nエアコン、冷蔵庫、洗濯機、テーブル",
    parsed: { pref: "東京都", center: "わん", ch: "受電", op: "山田", name: "おおた しんいち", postal: "160-0023", addr: "東京都新宿区西新宿1-2-3 グランドタワー1505", phone: "090-1234-5678", date: "2/14", time: "14-16時", items: "エアコン、冷蔵庫、洗濯機、テーブル", note: "緊急・当日希望 / パック希望" },
  },
  {
    id: 4, center: "ネコ", group: "埼玉案件", time: "11:30", status: "error",
    raw: "埼玉　ネコ　Web\nきむら　だいすけ\n330-0000\n埼玉県さいたま市\n不明\n2/15\nハウスクリーニング希望",
    parsed: { pref: "埼玉県", center: "ネコ", ch: "Web", op: "—", name: "きむら だいすけ", postal: "330-0000", addr: "埼玉県さいたま市（詳細不明）", phone: "未記載", date: "2/15", time: "未指定", items: "ハウスクリーニング", note: "⚠ 電話番号・住所詳細・時間が未記載" },
  },
  {
    id: 5, center: "ネコ", group: "神奈川案件", time: "12:15", status: "pending",
    raw: "神奈川　ネコ　受電　滝沢\nやまだ　こうへい\n〒251-0052\n神奈川県藤沢市藤沢1-5-7\nパレス藤沢302\n080-9876-5432\n2/16　9-11時\n引っ越し 2DK→1K\nダンボール20箱、家電一式",
    parsed: { pref: "神奈川県", center: "ネコ", ch: "受電", op: "滝沢", name: "やまだ こうへい", postal: "251-0052", addr: "神奈川県藤沢市藤沢1-5-7 パレス藤沢302", phone: "080-9876-5432", date: "2/16", time: "9-11時", items: "引っ越し 2DK→1K（ダンボール20箱、家電一式）", note: "" },
  },
];

export const SETTLEMENTS: Settlement[] = [
  { staff: "田中", customer: "むらた", amount: 40000, pay: "cash" },
  { staff: "佐藤", customer: "たきざわ", amount: 22000, pay: "cash" },
  { staff: "鈴木", customer: "かわしま", amount: 41046, creditExtra: 1654, pay: "mixed" },
  { staff: "佐藤", customer: "ほり", amount: 75000, pay: "cash" },
  { staff: "佐藤", customer: "みすぎ", amount: 0, pay: "cancel" },
  { staff: "高橋", customer: "いしま", amount: 166269, creditExtra: 6731, pay: "mixed" },
  { staff: "渡辺", customer: "よしだ", amount: 100000, pay: "cash" },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 1, type: "urgent", msg: "当日依頼が3件あります", time: "5分前" },
  { id: 2, type: "auto", msg: "LINE経由で新規案件が自動登録", time: "12分前" },
  { id: 3, type: "cancel", msg: "CS-0023がキャンセル", time: "25分前" },
  { id: 4, type: "done", msg: "CS-0045完了（¥85,000）", time: "1時間前" },
];

export const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}月`,
  売上: rnd(250, 550) * 10000,
}));

export const weekData = ["日", "月", "火", "水", "木", "金", "土"].map((d) => ({
  label: d,
  案件数: rnd(5, 28),
}));

export const categoryDonut = CATEGORIES.map((c) => ({
  name: c.label,
  value: rnd(15, 60),
  color: c.color,
}));

export const hourData = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 8}時`,
  案件数: rnd(2, 15) + (i > 1 && i < 9 ? 6 : 0),
}));

export const PLATFORMS: Platform[] = [
  { id: "google",    name: "Google広告",    type: "リスティング", color: "#4285f4", accent: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "yahoo",     name: "Yahoo!広告",    type: "リスティング", color: "#ff0033", accent: "bg-red-50 text-red-700 border-red-200" },
  { id: "instagram", name: "Instagram広告", type: "SNS",         color: "#e1306c", accent: "bg-pink-50 text-pink-700 border-pink-200" },
  { id: "facebook",  name: "Facebook広告",  type: "SNS",         color: "#1877f2", accent: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "line_ad",   name: "LINE広告",      type: "SNS",         color: "#06c755", accent: "bg-green-50 text-green-700 border-green-200" },
];

export const LPS: LP[] = [
  { id: "lp-001", name: "不用品回収_東京_メイン",       url: "https://example.com/fuyouhin-tokyo",     cat: "fuyouhin", platform: "google",    area: "東京都",   status: "active",  cost: 285000, impressions: 42000, clicks: 1890, cases: 67, revenue: 3685000 },
  { id: "lp-002", name: "不用品回収_神奈川_メイン",     url: "https://example.com/fuyouhin-kanagawa",  cat: "fuyouhin", platform: "google",    area: "神奈川県", status: "active",  cost: 195000, impressions: 31000, clicks: 1430, cases: 48, revenue: 2496000 },
  { id: "lp-003", name: "引っ越し_関東_春キャンペーン", url: "https://example.com/hikkoshi-spring",    cat: "hikkoshi", platform: "yahoo",     area: "関東",     status: "active",  cost: 180000, impressions: 28000, clicks: 1120, cases: 35, revenue: 2800000 },
  { id: "lp-004", name: "ハウスクリーニング_東京",       url: "https://example.com/cleaning-tokyo",     cat: "cleaning", platform: "google",    area: "東京都",   status: "active",  cost: 120000, impressions: 19500, clicks: 780,  cases: 28, revenue: 1540000 },
  { id: "lp-005", name: "不用品回収_SNS訴求",           url: "https://example.com/fuyouhin-sns",       cat: "fuyouhin", platform: "instagram", area: "全国",     status: "active",  cost: 95000,  impressions: 85000, clicks: 2100, cases: 22, revenue: 1100000 },
  { id: "lp-006", name: "水道修理_緊急対応LP",          url: "https://example.com/suidou-emergency",   cat: "suidou",   platform: "google",    area: "東京都",   status: "active",  cost: 150000, impressions: 22000, clicks: 1320, cases: 41, revenue: 2870000 },
  { id: "lp-007", name: "不用品回収_LINE友達登録",      url: "https://example.com/fuyouhin-line",      cat: "fuyouhin", platform: "line_ad",   area: "関東",     status: "paused",  cost: 60000,  impressions: 35000, clicks: 980,  cases: 12, revenue: 540000 },
  { id: "lp-008", name: "引っ越し_Yahoo検索",           url: "https://example.com/hikkoshi-yahoo",     cat: "hikkoshi", platform: "yahoo",     area: "関東",     status: "paused",  cost: 85000,  impressions: 15000, clicks: 620,  cases: 15, revenue: 1050000 },
];

export const regionData = PREFS.slice(0, 7).map((p) => ({
  name: p.replace(/[都府県]/g, ""),
  rev: rnd(50, 200) * 10000,
}));

export const adROIData = AD_SRC.map((s) => ({
  name: s,
  cost: rnd(5, 30) * 10000,
  cases: rnd(10, 60),
  rev: rnd(30, 200) * 10000,
  cvr: rnd(3, 18),
}));
