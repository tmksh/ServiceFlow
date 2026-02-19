export type CategoryId = "fuyouhin" | "hikkoshi" | "cleaning" | "suidou" | "kagi" | "repair";

export type CaseStatus = "new" | "estimate" | "confirmed" | "inProgress" | "completed" | "cancelled";

export type Channel = "受電" | "LINE" | "Web";

export type PayMethod = "cash" | "credit" | null;

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
  icon: string;
}

export interface StatusDef {
  label: string;
  className: string;
}

export interface Case {
  id: string;
  customer: string;
  phone: string;
  postal: string;
  category: Category;
  status: CaseStatus;
  pref: string;
  addr: string;
  date: string;
  time: string;
  amount: number;
  source: string;
  center: string;
  channel: Channel;
  staff: string;
  items: string[];
  payMethod: PayMethod;
  urgent: boolean;
  lineAuto: boolean;
}

export interface LineMessage {
  id: number;
  center: string;
  group: string;
  time: string;
  status: "pending" | "registered" | "error";
  raw: string;
  parsed: {
    pref: string;
    center: string;
    ch: string;
    op: string;
    name: string;
    postal: string;
    addr: string;
    phone: string;
    date: string;
    time: string;
    items: string;
    note: string;
  };
}

export interface Settlement {
  staff: string;
  customer: string;
  amount: number;
  creditExtra?: number;
  pay: "cash" | "credit" | "mixed" | "cancel";
}

export interface Notification {
  id: number;
  type: "urgent" | "auto" | "cancel" | "done";
  msg: string;
  time: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

export interface Platform {
  id: string;
  name: string;
  type: "リスティング" | "SNS";
  color: string;
  accent: string;
}

export interface LP {
  id: string;
  name: string;
  url: string;
  cat: string;
  platform: string;
  area: string;
  status: "active" | "paused";
  cost: number;
  impressions: number;
  clicks: number;
  cases: number;
  revenue: number;
}
