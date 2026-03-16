# スマカレ プロジェクト仕様書

> **文書バージョン**: 3.0
> **最終更新日**: 2026年3月16日
> **ステータス**: Phase 2（Next.js フロントエンド実装）完了 / Phase 3（バックエンド・API連携）設計完了・実装待ち

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [ビジネス要件](#2-ビジネス要件)
3. [システムアーキテクチャ](#3-システムアーキテクチャ)
4. [機能仕様](#4-機能仕様)
5. [データモデル](#5-データモデル)
6. [画面仕様](#6-画面仕様)
7. [外部連携 設計](#7-外部連携-設計)
8. [非機能要件](#8-非機能要件)
9. [開発規約](#9-開発規約)
10. [開発計画](#10-開発計画)
11. [競合分析サマリー](#11-競合分析サマリー)
12. [リポジトリ構成](#12-リポジトリ構成)
13. [参照資料](#13-参照資料)

---

## 1. プロジェクト概要

### 1.1 プロダクト名

**スマカレ** — 自動顧客管理プラットフォーム

### 1.2 コンセプト

> 一般消費者向け生活サービス業に特化した、オールインワン案件管理プラットフォーム

### 1.3 対象業種

| 業種カテゴリ | ID | カラーコード |
|:---|:---|:---|
| 不用品回収 | `fuyouhin` | `#6366f1` |
| 引っ越し | `hikkoshi` | `#8b5cf6` |
| ハウスクリーニング | `cleaning` | `#06b6d4` |
| 水道修理 | `suidou` | `#3b82f6` |
| 鍵トラブル | `kagi` | `#f59e0b` |
| 修理・メンテナンス | `repair` | `#10b981` |

### 1.4 解決する課題

現在の業務フローでは、**LINE・TimeTree・Googleスプレッドシート**間で手動による情報転記が行われており、以下の問題が発生している。

- 月間1,000件超の案件を手作業で処理する膨大な工数
- 対応漏れ・情報更新の遅延による事業リスク
- 非効率な業務による機会損失（月額約50万円相当）

### 1.5 提供価値

- LINEグループへの投稿を**自動で案件登録**（手動転記の撲滅）
- 案件の発生から完了、売上分析までを**一気通貫で自動化**
- **リアルタイム通知**による対応漏れの防止
- **経営ダッシュボード**によるデータドリブンな意思決定支援

---

## 2. ビジネス要件

### 2.1 ビジネスモデル

| 項目 | 内容 |
|:---|:---|
| サービス形態 | SaaS（月額サブスクリプション） |
| 価格設定 | 月額 ¥30,000〜¥50,000 |
| 収益目標 | 1年後：契約100社、年間売上1億円 |
| 収益配分 | 営業利益の50:50（開発側：事業側） |
| 追加オプション | 年間契約割引、初期導入サポートプラン |

### 2.2 パートナーシップ体制

| 役割 | 担当 | 主な責務 |
|:---|:---|:---|
| 開発パートナー | 加藤様サイド | システム設計・開発・保守・アップデート |
| 事業パートナー | iwatakento様サイド | 業界ノウハウ提供・営業活動・テストマーケティング |

### 2.3 市場ポジション

- **ターゲット市場**: 生活サービス業（ブルーオーシャン領域）
- **差別化要因**: LINE連携 × 業界特化 × スケジュール管理 × 売上分析の統合
- **参入障壁**: 一度導入されると業務フローに深く定着 → 低解約率

---

## 3. システムアーキテクチャ

### 3.1 技術スタック

| レイヤー | 技術 | 備考 |
|:---|:---|:---|
| **フロントエンド（Web）** | Next.js 15 / React / TypeScript / Tailwind CSS | PC・スマホ兼用Webアプリ（PWA対応）|
| **フロントエンド（モバイル）** | React Native / Expo / TypeScript | 将来対応（Phase 4以降） |
| **バックエンド（API Routes）** | Next.js App Router API Routes | Phase 3で実装 |
| **データベース** | Supabase（PostgreSQL） | Phase 3で接続 |
| **リアルタイム** | Supabase Realtime | コメント・通知のリアルタイム同期 |
| **認証** | Supabase Auth | JWT + Row Level Security |
| **ファイルストレージ** | Supabase Storage / AWS S3 | 写真・録音ファイル |
| **外部API（通信）** | LINE Messaging API | メッセージ受信・案件自動登録 |
| **外部API（通話・録音）** | Twilio Voice API | アプリ内発信・通話録音（将来） |
| **外部API（AI）** | OpenAI Whisper / GPT-4o | 文字起こし・要約・情報抽出（将来） |
| **チャートライブラリ** | Recharts | グラフ・データ可視化（実装済み） |
| **デプロイ** | Netlify（CI/CD：GitHub連携） | 現在稼働中 |

### 3.2 対応デバイス

| デバイス | 実装方法 | 主な用途 |
|:---|:---|:---|
| PC（Webブラウザ） | Next.js Webアプリ | バックオフィス操作、分析、設定 |
| スマートフォン（Web） | Responsive + PWA | 現場スタッフの案件確認・ステータス更新 |
| スマートフォン（ネイティブ） | React Native / Expo（将来） | オフライン対応が必要な場合 |

### 3.3 アーキテクチャ概要図

```
┌─────────────────────────────────────────────────────┐
│                    クライアント層                       │
│  ┌────────────────────────────────────────────────┐  │
│  │          Next.js Web App (PC / PWA)            │  │
│  │  ダッシュボード / 案件 / カレンダー / LINE / 設定  │  │
│  └──────────────────────┬─────────────────────────┘  │
└─────────────────────────┼───────────────────────────┘
                          │ Next.js API Routes
                          ▼
┌─────────────────────────────────────────────────────┐
│                  サーバー層（API Routes）               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ /api/cases   │  │ /api/line/   │  │ /api/docs │  │
│  │ 案件CRUD     │  │  webhook     │  │ 書類管理   │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │/api/comments │  │/api/analytics│                  │
│  │ コメント管理  │  │  売上集計     │                  │
│  └──────────────┘  └──────────────┘                  │
└──────────────────────┬──────────────────────────────┘
                       │
     ┌─────────────────┼────────────────────────────┐
     ▼                 ▼                            ▼
┌──────────┐   ┌──────────────┐   ┌────────────────────┐
│ Supabase │   │  LINE        │   │  将来連携API群       │
│ (Postgres│   │  Messaging   │   │  Twilio / Whisper   │
│  + Auth  │   │  API         │   │  GPT-4o / S3        │
│  + RT    │   │  (Webhook)   │   └────────────────────┘
│  + Stor) │   └──────────────┘
└──────────┘
```

---

## 4. 機能仕様

### 4.1 機能一覧

| # | 機能分類 | 機能名 | 優先度 | 実装状態 |
|:---|:---|:---|:---|:---|
| F-01 | LINE自動化 | LINE Webhook受信・解析 | **最高** | UIのみ（設計完了） |
| F-02 | LINE自動化 | 案件自動登録 | **最高** | UIのみ（設計完了） |
| F-03 | LINE自動化 | キャンセル自動反映 | 高 | UIのみ |
| F-04 | 案件管理 | 案件CRUD（DB連携） | **最高** | UIのみ（モックデータ） |
| F-05 | 案件管理 | ステータス変更 | **最高** | UI実装済み |
| F-06 | 案件管理 | 顧客管理（VIP・リピーター） | 高 | UI実装済み |
| F-07 | 案件管理 | 検索・フィルタ | 高 | UI実装済み |
| F-08 | 案件管理 | 案件コメント（社内チャット） | 高 | UIのみ（設計完了） |
| F-09 | スケジュール | カレンダー表示（月/週/日） | **最高** | UI実装済み |
| F-10 | スケジュール | グループ管理 | 高 | UI実装済み |
| F-11 | 通知 | リアルタイム通知 | **最高** | UIのみ |
| F-12 | 通知 | アプリ内通知センター | 中 | UI実装済み |
| F-13 | 精算 | 日報・精算管理 | 高 | UI実装済み |
| F-14 | 精算 | 精算エクスポート | 中 | UIのみ |
| F-15 | 分析 | ダッシュボード（期間フィルタ付き） | **最高** | UI実装済み |
| F-16 | 分析 | 売上分析 | 高 | UI実装済み |
| F-17 | 分析 | 広告・LP管理 | 高 | UI実装済み |
| F-18 | 分析 | レポート出力 | 中 | UIのみ |
| F-19 | 書類管理 | 見積書・請求書・領収書 | 高 | UI実装済み |
| F-20 | 設定 | LINE連携設定 | 高 | UIのみ |
| F-21 | 設定 | 通知設定 | 中 | UIのみ |
| F-22 | 設定 | 会社情報・テーマ・権限管理 | 中 | UI実装済み |
| F-23 | PWA | ホーム画面追加・オフライン | 中 | 実装済み |
| F-24 | 将来 | アプリ内発信（Twilio） | 高 | UIのみ（tel:リンク） |
| F-25 | 将来 | 通話録音・文字起こし・AI要約 | 高 | 未着手 |

### 4.2 案件ステータスフロー

```
    ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐
    │ 新規 │ ──▶ │ 見積 │ ──▶ │ 確定 │ ──▶ │対応中│ ──▶ │ 完了 │
    └──────┘     └──────┘     └──────┘     └──────┘     └──────┘
       │            │            │            │
       └────────────┴────────────┴────────────┘
                            │
                            ▼
                       ┌──────────┐
                       │キャンセル│
                       └──────────┘
```

| ステータス | ID | UIカラー |
|:---|:---|:---|
| 新規 | `new` | Indigo（紫青） |
| 見積 | `estimate` | Violet（紫） |
| 確定 | `confirmed` | Blue（青） |
| 対応中 | `inProgress` | Amber（黄） |
| 完了 | `completed` | Emerald（緑） |
| キャンセル | `cancelled` | Red（赤） |

### 4.3 LINE自動登録フロー（Phase 3 実装対象）

```
  LINEグループ（コールセンター）
       │
       │ ① メッセージ投稿
       │   例：「東京 ネコ 受電 田中
       │        やまだたろう
       │        〒160-0023
       │        東京都新宿区西新宿1-2-3
       │        090-1234-5678
       │        3/20 14-16時
       │        不用品回収 テレビ・冷蔵庫」
       ▼
  LINE Messaging API
       │ ② Webhook POST
       ▼
  Next.js API Route
  /api/line/webhook
       │ ③ 署名検証（HMAC-SHA256）
       │ ④ テキスト解析（line-parser）
       │    → 顧客名・電話・住所・品目・日時を抽出
       ▼
  Supabase
  line_messages テーブルに保存
  （status: "pending"）
       │ ⑤ 自動登録モードが ON の場合
       ▼
  cases テーブルに自動挿入
  （is_line_auto: true）
       │ ⑥ 緊急フラグの判定
       │    「緊急」「当日」「即日」を含む → is_urgent: true
       ▼
  Supabase Realtime → フロントに即時反映
  （LINE受信画面・ダッシュボードのバッジ更新）
```

### 4.4 通話AI機能フロー（Phase 4 将来実装）

```
オペレーター（スマカレ）
       │ ① 電話番号クリック → 発信
       ▼
  Twilio Voice API ── 通話仲介 ──▶ 顧客の電話
       │ ② デュアルチャンネル録音
       ▼
  通話終了 → 録音ファイル（MP3）生成 → S3保存
       │ ③ Webhook → /api/twilio/recording
       ▼
  OpenAI Whisper API（文字起こし）
       ▼
  GPT-4o API（要約・案件情報抽出）
       ▼
  cases テーブルの call_log に自動保存
```

### 4.5 案件コメント機能（Phase 3 実装対象）

スタッフ間のリアルタイム社内チャット。案件詳細モーダル（`QuickCaseModal`）内に実装済みのUIをSupabase Realtimeと接続する。

```
スタッフA がコメント送信
       │
       ▼
  POST /api/cases/{id}/comments
       │
       ▼
  Supabase case_comments テーブルに INSERT
       │
       ▼
  Supabase Realtime (postgres_changes)
       │
       ▼
  同じ案件を開いている全スタッフの画面にリアルタイム反映
```

---

## 5. データモデル

### 5.1 Supabase テーブル一覧

| テーブル名 | 説明 | 状態 |
|:---|:---|:---|
| `cases` | 案件マスター | 作成済み（50件のシードデータあり） |
| `line_messages` | LINE受信メッセージ | 作成済み（5件のシードデータあり） |
| `members` | スタッフ・メンバー | 作成済み |
| `organizations` | テナント（会社） | 作成済み |
| `settlements` | 日報・精算 | 作成済み（7件） |
| `platforms` | 広告プラットフォーム | 作成済み（6件） |
| `landing_pages` | LP管理 | 作成済み（8件） |
| `master_options` | 選択肢マスター | 作成済み（105件） |
| `case_comments` | 案件コメント | **未作成（要マイグレーション）** |
| `call_logs` | 通話録音ログ | **未作成（Phase 4）** |

### 5.2 主要テーブルスキーマ

#### cases（案件）

| カラム | 型 | 説明 |
|:---|:---|:---|
| `id` | text PK | 案件ID（例: `CS-0001`） |
| `customer_name` | text | 顧客名 |
| `phone` | text | 電話番号 |
| `postal_code` | text | 郵便番号 |
| `prefecture` | text | 都道府県 |
| `address` | text | 住所（詳細） |
| `category` | ENUM | サービスカテゴリ（6種） |
| `status` | ENUM | ステータス（6種） |
| `scheduled_date` | date | 対応予定日 |
| `scheduled_time` | text | 対応予定時間 |
| `amount` | integer | 金額（円） |
| `source` | text | 流入元 |
| `center` | text | コールセンター |
| `channel` | ENUM | 受付チャネル |
| `staff` | text | 担当スタッフ |
| `items` | jsonb | 品目リスト |
| `payment_method` | ENUM | 決済方法 |
| `is_urgent` | boolean | 緊急フラグ |
| `is_line_auto` | boolean | LINE自動登録フラグ |
| `notes` | text | 備考 |
| `created_at` | timestamptz | 作成日時 |
| `updated_at` | timestamptz | 更新日時 |

#### line_messages（LINE受信）

| カラム | 型 | 説明 |
|:---|:---|:---|
| `id` | integer PK | メッセージID |
| `center` | text | センター名 |
| `line_group` | text | LINEグループ名 |
| `received_at` | timestamptz | 受信日時 |
| `status` | ENUM | `pending` / `registered` / `error` |
| `raw_message` | text | LINEの生テキスト |
| `parsed_data` | jsonb | 解析結果（顧客名・住所・品目等） |
| `case_id` | text FK | 登録された案件ID（nullable） |
| `created_at` | timestamptz | 作成日時 |

#### case_comments（案件コメント・要作成）

```sql
CREATE TABLE case_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     TEXT NOT NULL REFERENCES cases(id),
  user_id     UUID NOT NULL REFERENCES members(id),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  deleted_at  TIMESTAMPTZ  -- 論理削除
);

CREATE INDEX idx_case_comments_case_id ON case_comments(case_id);
CREATE INDEX idx_case_comments_created_at ON case_comments(created_at);
```

### 5.3 書類（Documents）スキーマ

| フィールド | 型 | 説明 |
|:---|:---|:---|
| `id` | VARCHAR PK | 書類ID（EST-0001 / INV-0001 / REC-0001） |
| `type` | ENUM | `estimate` / `invoice` / `receipt` |
| `case_id` | VARCHAR FK | 紐付け案件ID |
| `customer` | VARCHAR | 顧客名 |
| `status` | ENUM | `draft` / `sent` / `accepted` / `cancelled` |
| `issue_date` | DATE | 発行日 |
| `valid_date` | DATE | 有効期限（見積書のみ） |
| `due_date` | DATE | 支払期限（請求書のみ） |
| `items` | JSON | 品目リスト（名称・数量・単価） |
| `note` | TEXT | 備考・特記事項 |
| `created_at` | DATETIME | 作成日時 |

### 5.4 精算（Settlements）スキーマ

| フィールド | 型 | 説明 |
|:---|:---|:---|
| `id` | INT PK | 精算ID |
| `staff` | VARCHAR | 担当スタッフ |
| `customer` | VARCHAR | 顧客名 |
| `amount` | INT | 金額 |
| `credit_extra` | INT | クレジット手数料 |
| `pay` | ENUM | `cash` / `credit` / `mixed` / `cancel` |
| `date` | DATE | 精算日 |
| `travel_cost` | INT | 交通費 |
| `work_hours` | FLOAT | 作業時間（時間） |
| `rating` | FLOAT | 評価（1〜5） |
| `created_at` | DATETIME | 作成日時 |

---

## 6. 画面仕様

### 6.1 グローバルナビゲーション

| # | メニュー名 | URL | アイコン | バッジ |
|:---|:---|:---|:---|:---|
| 1 | ホーム | `/` | Grid | — |
| 2 | LINE受信 | `/line` | Inbox | 未処理件数 |
| 3 | 案件管理 | `/cases` | FileText | — |
| 4 | カレンダー | `/calendar` | Calendar | — |
| 5 | 書類管理 | `/docs` | Folder | 未処理件数 |
| 6 | 日報・精算 | `/settlement` | Calculator | — |
| 7 | 売上分析 | `/analytics` | BarChart3 | — |
| 8 | 広告・LP管理 | `/ads` | Globe | — |
| 9 | レポート | `/reports` | ClipboardList | — |
| — | 設定 | `/settings` | Settings | — |

**レイアウト**: デスクトップ（`lg:` 1024px以上）はサイドバー（`w-44`）、モバイルはボトムナビゲーション（5項目）。

### 6.2 各画面の仕様

#### 6.2.1 ダッシュボード（`/`）

**目的**: 経営状況の俯瞰、重要指標の即時把握

| セクション | 内容 |
|:---|:---|
| 期間フィルタ | 今日 / 今週 / 今月 / 先月 の切り替え |
| KPIカード（4枚） | 売上合計・案件数・キャンセル率・平均単価（前月比付き） |
| 緊急案件アラート | 当日依頼など緊急対応が必要な案件。「対応」ボタンで詳細モーダル表示 |
| 月次売上推移 | エリアチャートによる12ヶ月推移（Recharts） |
| カテゴリ分布 | PieChartによるサービスカテゴリ別案件数 |
| 直近の案件 | 最新案件7件のリスト。クリックで詳細モーダル（`QuickCaseModal`） |
| 時間帯別案件数 | 棒グラフによる8時〜19時の案件分布 |

#### 6.2.2 LINE受信（`/line`）

**目的**: LINEメッセージの確認・自動登録管理・フォーム設定

| タブ | 内容 |
|:---|:---|
| LINE自動取込 | 受信メッセージのリスト（pending/registered/error）、解析プレビュー、自動登録トグル |
| フォーム設定 | 受電フォームの項目表示/必須設定、選択肢カスタマイズ |

**Phase 3 API接続**:
- `GET /api/line/messages` → リスト取得
- `POST /api/line/messages/{id}/register` → 案件登録
- `POST /api/line/webhook` → LINE Webhookエンドポイント

#### 6.2.3 案件管理（`/cases`）

**目的**: 全案件の一覧管理・詳細確認・顧客管理

| タブ | 内容 |
|:---|:---|
| 案件一覧 | テーブル形式の案件リスト（ステータスフィルタ、テキスト検索、ページネーション） |
| 顧客一覧 | 顧客リスト（VIP・リピーター判定、累計金額、ソート機能） |

**案件詳細モーダル**（`QuickCaseModal`）:
- 顧客情報（氏名・電話・住所）
- 案件情報（ステータス・日時・担当・金額・チャネル）
- 品目リスト
- フラグ（緊急・LINE自動・VIP・リピーター）
- コメント（社内チャット）
- 写真タブ（UI実装済み）

**新規案件モーダル**（4ステップ）:
1. カテゴリ選択
2. 顧客情報入力（氏名・電話・住所）
3. 案件詳細入力（日時・スタッフ・金額・チャネル）
4. 確認・登録

#### 6.2.4 カレンダー（`/calendar`）

**目的**: カレンダー形式での案件スケジュール管理

| ビュー | 対象デバイス | 内容 |
|:---|:---|:---|
| 月ビュー | PC・モバイル | 月間グリッド、各日に案件数をバッジ表示 |
| 週ビュー | モバイル | 横スクロール日付ピッカー + 選択日の案件リスト |
| 日ビュー | モバイル | 7日間横スクロール + 時間軸タイムライン |
| グループ管理 | PC | 左サイドバー（縦リスト）でグループ切り替え |

**PC レイアウト**: 左サイドバー（`w-48 xl:w-56`）にグループ縦リスト + 右メインエリアにカレンダー。

**モバイル**: アクティブグループ名をアプリヘッダーに表示。グループ選択は `CalendarGroupPickerModal`（ボトムシート）。

#### 6.2.5 書類管理（`/docs`）

| タブ | 内容 |
|:---|:---|
| 見積書 | 見積書リスト（KPI付き）、PDF風プレビュー、3ステップ作成フォーム |
| 請求書 | 請求書リスト、PDF風プレビュー |
| 領収書 | 領収書リスト（支払済み請求書からの自動発行バナー付き） |

#### 6.2.6 日報・精算（`/settlement`）

| タブ | 内容 |
|:---|:---|
| 精算管理 | KPIカード（総売上・現金・クレジット・手数料）、スタッフ別精算テーブル |
| 作業報告 | KPI（完了件数・作業時間・交通費・平均評価）、個人報告カード |

#### 6.2.7 売上分析（`/analytics`）

| セクション | 内容 |
|:---|:---|
| 期間フィルタ | 月次/四半期/年次の切り替え |
| KPIカード（4枚） | 総売上・総案件数・広告費・平均ROAS（前期比付き） |
| 月次売上推移 | エリアチャート（Recharts） |
| 曜日別案件分布 | 棒グラフ（Recharts） |
| サービス別案件分布 | PieChart（Recharts） |
| 広告ROI比較 | プラットフォーム別の比較表 |

#### 6.2.8 広告・LP管理（`/ads`）

| タブ | 内容 |
|:---|:---|
| LP一覧 | LPリスト（CPA・CVR・ROAS付き）、KPI一覧、詳細モーダル |
| プラットフォーム | 広告媒体ごとの比較分析カード |
| 推移分析 | チャネル別月次売上推移・ROAS月次推移 |

#### 6.2.9 レポート（`/reports`）

3つのサブページをタブ切り替えで表示:
- 日報・精算（`SettlementPage` を埋め込み）
- 売上分析（`AnalyticsPage` を埋め込み）
- 広告・LP管理（`AdsPage` を埋め込み）

#### 6.2.10 設定（`/settings`）

| タブ | 内容 |
|:---|:---|
| 外観 | テーマ設定（ライト/ダーク/システム）、アニメーション・コンパクト表示等 |
| ラベル管理 | スケジュール・案件の色分けラベルCRUD |
| リスト管理 | カレンダーリスト・エリアCRUD |
| 従業員管理 | スタッフの招待・権限・アクティブ管理 |
| 権限管理 | ロール別アクセス権限マトリクス |
| 会社情報 | 企業名・連絡先・LINE連携設定・通知設定 |

---

## 7. 外部連携 設計

### 7.1 LINE Messaging API（Phase 3 最優先）

#### 概要

| 項目 | 内容 |
|:---|:---|
| 連携方式 | Webhook |
| 用途 | LINEグループからのメッセージ受信・解析・案件自動登録 |
| 認証 | `LINE_CHANNEL_SECRET` による署名検証（HMAC-SHA256） |

#### 必要な環境変数

```env
LINE_CHANNEL_SECRET=           # 署名検証キー
LINE_CHANNEL_ACCESS_TOKEN=     # メッセージ送信用トークン
```

#### APIエンドポイント設計

```
POST /api/line/webhook
  ← LINE からの Webhook 受信
  ← 署名検証 → 解析 → line_messages に保存 → 自動登録
  → HTTP 200 を即座に返す（5秒以内に応答必須）

GET  /api/line/messages
  ← フロントからの一覧取得（status, center, page フィルタ）
  → { data: LineMessage[], total: number }

POST /api/line/messages/{id}/register
  ← 手動で案件登録ボタン押下時
  → line_messages.status = "registered" に更新
  → cases テーブルに INSERT
  → { case_id: string }
```

#### メッセージ解析仕様（`src/lib/line-parser.ts`）

LINEグループへの投稿テキストから以下を正規表現・行解析で抽出:

```
入力例:
  神奈川 ネコ 受電 滝沢
  あかざわ たつゆき
  〒248-0005
  神奈川県逗子市桜山5-39-16
  090-6195-0960
  2/17 9-12時
  不用品 ベッドフレーム・マットレス

抽出結果:
  prefecture:  "神奈川県"
  center:      "ネコ"
  channel:     "受電"
  operator:    "滝沢"
  name:        "あかざわ たつゆき"
  postal:      "248-0005"
  address:     "神奈川県逗子市桜山5-39-16"
  phone:       "090-6195-0960"
  date:        "2/17"
  time:        "9-12時"
  items:       "ベッドフレーム・マットレス"
  is_urgent:   false
```

### 7.2 Supabase

| 項目 | 内容 |
|:---|:---|
| 用途 | データ永続化・認証・リアルタイム同期 |
| 接続方法 | `@supabase/supabase-js` クライアント |

#### 必要な環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=          # Supabase プロジェクト URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # 公開 anon キー（フロント用）
SUPABASE_SERVICE_ROLE_KEY=         # サービスロールキー（API Route用・秘密）
```

#### リアルタイム活用場所

| 用途 | テーブル | イベント |
|:---|:---|:---|
| LINE受信通知 | `line_messages` | INSERT |
| 案件コメント | `case_comments` | INSERT |
| 案件ステータス更新 | `cases` | UPDATE |

### 7.3 Google Calendar API（暫定・将来検討）

| 項目 | 内容 |
|:---|:---|
| 連携方式 | REST API |
| 用途 | スケジュール同期（検討中） |
| 備考 | スマカレ内カレンダーで代替できる可能性あり |

### 7.4 Twilio Voice API（Phase 4 将来）

| 項目 | 内容 |
|:---|:---|
| 連携方式 | REST API + TwiML + Webhook |
| 用途 | アプリ内発信・通話録音（デュアルチャンネル） |

### 7.5 OpenAI Whisper / GPT-4o（Phase 4 将来）

| 項目 | 内容 | コスト |
|:---|:---|:---|
| Whisper API | 通話録音の文字起こし | $0.006/分 ≒ ¥0.9/分 |
| GPT-4o API | 要約・構造化情報抽出 | 約¥3/件 |

### 7.6 AWS S3（Phase 4 将来）

| 項目 | 内容 |
|:---|:---|
| 用途 | 録音ファイル（MP3）の長期保管 |
| 暗号化 | AES-256（サーバーサイド） |
| 保管期間 | デフォルト90日 |

---

## 8. 非機能要件

### 8.1 パフォーマンス

| 項目 | 目標 |
|:---|:---|
| ページ初期表示 | 3秒以内 |
| API応答時間 | 500ms以内（95パーセンタイル） |
| 同時接続数 | 100ユーザー以上 |
| データ処理 | 月間1,000件以上の案件処理 |

### 8.2 セキュリティ

| 項目 | 対応 |
|:---|:---|
| 認証 | Supabase Auth（JWT）+ Row Level Security |
| 通信 | HTTPS必須 |
| データ保護 | 個人情報の暗号化保存 |
| アクセス制御 | ロールベースアクセスコントロール（RBAC） |
| LINE署名検証 | Webhook受信時に HMAC-SHA256 で必ず検証 |

### 8.3 可用性

| 項目 | 目標 |
|:---|:---|
| 稼働率 | 99.5%以上 |
| バックアップ | Supabase 自動バックアップ（日次） |
| 障害復旧 | RTO: 4時間以内 |

### 8.4 レスポンシブ・PWA対応

- **ブレークポイント**: Tailwind CSS の `lg:` (1024px) を境界にモバイル/デスクトップ切り替え
- **モバイル対応**: ボトムナビゲーション（5項目）+ `CalendarGroupPickerModal` 等のボトムシート
- **サイドバー**: デスクトップ固定幅 `w-44` (176px)
- **PWA**: `manifest.json` 実装済み、ホーム画面追加・スタンドアロン表示対応
- **プルトゥリフレッシュ**: `PullToRefresh` コンポーネントで全ページ対応

---

## 9. 開発規約

### 9.1 コーディング規約

| 項目 | ルール |
|:---|:---|
| フォーマッター | Prettier（デフォルト設定）、コミット時に自動フォーマット |
| 命名規則（変数・関数） | `camelCase` |
| 命名規則（クラス・コンポーネント） | `PascalCase` |
| 命名規則（ファイル名） | `kebab-case` |
| モジュール | ES Modules (`import/export`) |
| 型定義 | TypeScript strict、`any` の使用は原則禁止 |
| コメント | 非自明な意図・トレードオフのみ記述（実装説明コメント禁止） |

### 9.2 Git運用

| 項目 | ルール |
|:---|:---|
| ブランチ戦略 | Git-flow (`main`, `develop`, `feature/issue-*`) |
| コミットメッセージ | Conventional Commits 規約準拠 |
| コミット例 | `feat: LINE自動登録機能を追加` / `fix: フックスエラーを修正` |

### 9.3 品質管理

| 項目 | ルール |
|:---|:---|
| テストフレームワーク | Jest |
| テストカバレッジ目標 | 80%以上 |
| テスト実行 | `npm test` |
| 静的解析 | ESLint（`npm run lint`） |
| ビルド | `npm run build` |

---

## 10. 開発計画

### 10.1 フェーズ概要

| フェーズ | 期間（目安） | 主な内容 | ステータス |
|:---|:---|:---|:---|
| **Phase 1** | 約1.5週間 | UIデザイン・モックアップ作成、基本設計 | **完了** |
| **Phase 2** | 約3週間〜1ヶ月 | Next.js フロントエンド全ページUI実装 | **完了** |
| **Phase 3** | 約1〜2ヶ月 | Supabase接続・LINE連携・コメント機能・認証 | **設計完了・実装待ち** |
| **Phase 4** | 約1〜2ヶ月 | 通話AI（Twilio + Whisper + GPT-4o）・S3 | 未着手 |
| **リリース** | 約3〜5ヶ月後 | 外部へのサービス提供開始 | — |

### 10.2 Phase 2 成果物（完了）

- [x] Next.js プロジェクトセットアップ（TypeScript / Tailwind CSS）
- [x] 共通UIコンポーネント（Card, Badge, StatCard, QuickCaseModal, BottomSheet等）
- [x] レイアウトシステム（AppShell, Sidebar, Header, BottomNav, MobileSidebar）
- [x] カレンダーヘッダーContext（CalendarHeaderProvider）
- [x] カスタムSVGロゴ（Logo / LogoIcon コンポーネント）
- [x] ダッシュボード（KPI・チャート・期間フィルタ・案件詳細モーダル）
- [x] LINE受信（メッセージ一覧・解析プレビュー・フォーム設定タブ）
- [x] 案件管理（一覧・詳細モーダル・新規登録モーダル・顧客一覧）
- [x] カレンダー（月/週/日ビュー・グループ管理・PC/モバイル最適化）
- [x] 書類管理（見積書・請求書・領収書）
- [x] 日報・精算（精算管理・作業報告タブ）
- [x] 売上分析（KPI・グラフ・期間フィルタ）
- [x] 広告・LP管理（LP一覧・プラットフォーム比較・トレンド分析）
- [x] レポート（統合タブビュー）
- [x] 設定（外観テーマ・ラベル・リスト・従業員・権限・会社情報）
- [x] PWA対応（manifest.json・Appleメタタグ）
- [x] ダークモード対応（ThemeProvider・ローカルストレージ保存）
- [x] 通知センター（ヘッダーベル・通知パネル・モバイルボトムシート）
- [x] Netlify デプロイ（GitHub連携・CI/CD）

### 10.3 Phase 3 実装タスク（優先度順）

#### Step 1: 環境構築（前提）
- [ ] Supabaseプロジェクト作成・`NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` / `SERVICE_ROLE_KEY` を `.env.local` に設定
- [ ] LINE Developers コンソールでチャンネル作成・Webhook URL設定
- [ ] `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` を `.env.local` に設定
- [ ] `@supabase/supabase-js` をインストール

#### Step 2: LINE Webhook + 案件自動登録
- [ ] `src/lib/line-parser.ts` — テキスト解析ロジック実装
- [ ] `src/app/api/line/webhook/route.ts` — Webhookエンドポイント（署名検証・保存）
- [ ] `src/app/api/line/messages/route.ts` — メッセージ一覧取得API
- [ ] `src/app/api/line/messages/[id]/register/route.ts` — 手動案件登録API
- [ ] `src/app/line/page.tsx` — モックデータから実APIに接続

#### Step 3: 案件管理 DB連携
- [ ] `src/app/api/cases/route.ts` — 案件一覧取得・新規登録API
- [ ] `src/app/api/cases/[id]/route.ts` — 案件詳細取得・更新・削除API
- [ ] `src/app/cases/page.tsx` — モックデータから実APIに接続

#### Step 4: 案件コメント（Supabase Realtime）
- [ ] Supabase で `case_comments` テーブルを作成（マイグレーション）
- [ ] `src/app/api/cases/[id]/comments/route.ts` — コメントCRUD API
- [ ] `src/components/ui/quick-case-modal.tsx` — ローカルstateからRealtimeに接続

#### Step 5: 認証・マルチテナント
- [ ] Supabase Auth でログイン画面実装
- [ ] Row Level Security ポリシー設定
- [ ] `middleware.ts` で未認証リダイレクト

---

## 11. 競合分析サマリー

### 11.1 競合マトリクス

| サービス | 業界特化 | LINE連携 | スケジュール | 分析機能 | 日本市場 |
|:---|:---|:---|:---|:---|:---|
| **スマカレ（本製品）** | ◎ | ◎ | ◎ | ◎ | ◎ |
| ONIKAN | ◎ | ✕ | △ | △ | ○ |
| センキャク | △ | ✕ | ○ | △ | ○ |
| プロワン | △ | ✕ | ○ | ○ | ○ |
| Housecall Pro | △ | ✕ | ○ | ◎ | ✕ |
| LINE CRM（Liny等） | ✕ | ◎ | ✕ | ✕ | ○ |

### 11.2 差別化ポイント

1. **LINE連携 × 業界特化**: 唯一無二の組み合わせ
2. **コールセンター連携**: 既存業務フロー（LINEグループ投稿）とのシームレスな統合
3. **オールインワン**: 案件管理 + スケジュール + 精算 + 分析を一元化
4. **シンプルなUI/UX**: IT不慣れなユーザーにも直感的に使えるデザイン

---

## 12. リポジトリ構成

```
ServiceFlow/
├── .cursorrules                          # Cursor AI ルール設定
├── CLAUDE.md                             # 開発指示書（技術スタック・規約）
├── README.md                             # プロジェクト概要
├── netlify.toml                          # Netlify デプロイ設定
├── package.json                          # 依存関係定義
├── tsconfig.json                         # TypeScript設定
├── tailwind.config.ts                    # Tailwind CSS設定
├── docs/
│   └── spec.md                           # プロジェクト仕様書（本ドキュメント）
├── めも.md                               # 設計メモ（案件コメント機能等）
├── public/
│   ├── favicon.svg                       # ファビコン
│   ├── manifest.json                     # PWAマニフェスト
│   └── icons/
│       └── icon.svg                      # PWAアイコン
└── src/
    ├── app/                              # Next.js App Router ページ
    │   ├── layout.tsx                    #   ルートレイアウト（ThemeProvider）
    │   ├── globals.css                   #   グローバルCSS（Liquid Glassアニメーション等）
    │   ├── page.tsx                      #   ダッシュボード（/）
    │   ├── line/page.tsx                 #   LINE受信（/line）
    │   ├── cases/page.tsx                #   案件管理（/cases）
    │   ├── calendar/page.tsx             #   カレンダー（/calendar）
    │   ├── docs/page.tsx                 #   書類管理（/docs）
    │   ├── settlement/page.tsx           #   日報・精算（/settlement）
    │   ├── analytics/page.tsx            #   売上分析（/analytics）
    │   ├── ads/page.tsx                  #   広告・LP管理（/ads）
    │   ├── reports/page.tsx              #   レポート（/reports）
    │   └── settings/page.tsx             #   設定（/settings）
    │
    │   [Phase 3 で追加予定]
    │   ├── api/
    │   │   ├── line/
    │   │   │   ├── webhook/route.ts      #   LINE Webhook受信
    │   │   │   └── messages/
    │   │   │       ├── route.ts          #   メッセージ一覧取得
    │   │   │       └── [id]/
    │   │   │           └── register/route.ts  # 手動案件登録
    │   │   ├── cases/
    │   │   │   ├── route.ts              #   案件一覧・新規登録
    │   │   │   └── [id]/
    │   │   │       ├── route.ts          #   案件詳細・更新・削除
    │   │   │       └── comments/route.ts #   案件コメントCRUD
    │   │   └── analytics/
    │   │       └── route.ts              #   売上集計API
    │   └── login/page.tsx                #   ログイン画面
    │
    ├── components/
    │   ├── layout/                       # レイアウトコンポーネント
    │   │   ├── app-shell.tsx             #   AppShell（CalendarHeaderProvider含む）
    │   │   ├── sidebar.tsx               #   PCサイドバー（w-44）
    │   │   ├── header.tsx                #   ヘッダー（通知センター・カレンダーメンバー）
    │   │   ├── bottom-nav.tsx            #   モバイルボトムナビ（5項目）
    │   │   ├── mobile-sidebar.tsx        #   モバイルサイドバー（スライドアウト）
    │   │   └── list-picker-modal.tsx     #   ListPickerModal / CalendarGroupPickerModal
    │   └── ui/                           # 共通UIコンポーネント
    │       ├── badge.tsx                 #   バッジ
    │       ├── bottom-sheet.tsx          #   ボトムシート
    │       ├── card.tsx                  #   カード
    │       ├── day-map-modal.tsx         #   デイマップモーダル
    │       ├── fab.tsx                   #   フローティングアクションボタン
    │       ├── logo.tsx                  #   SVGロゴ（Logo / LogoIcon）
    │       ├── pull-to-refresh.tsx       #   プルトゥリフレッシュ
    │       ├── quick-case-modal.tsx      #   案件詳細モーダル（コメント機能付き）
    │       ├── search-input.tsx          #   検索インプット
    │       ├── skeleton.tsx              #   スケルトンローディング
    │       └── stat-card.tsx             #   KPI統計カード
    ├── lib/
    │   ├── calendar-header-context.tsx   # CalendarHeaderProvider / useCalendarHeader
    │   ├── constants.ts                  # NAV_ITEMS・STATUS_MAP等の定数
    │   ├── mock-data.ts                  # モックデータ（Phase 3で実APIに置換）
    │   ├── theme-provider.tsx            # テーマ管理（ダークモード対応）
    │   └── utils.ts                      # fmt()・cn()等のユーティリティ
    │
    │   [Phase 3 で追加予定]
    │   ├── supabase.ts                   # Supabaseクライアント（browser / server）
    │   └── line-parser.ts                # LINEメッセージ解析ロジック
    │
    └── types/
        └── index.ts                      # Case・CalendarGroup・LineMessage等の型定義
```

---

## 13. 参照資料

| 資料 | URL/場所 |
|:---|:---|
| LINE Messaging API ドキュメント | https://developers.line.biz/ja/docs/messaging-api/ |
| Next.js ドキュメント | https://nextjs.org/docs |
| Supabase ドキュメント | https://supabase.com/docs |
| Supabase Realtime | https://supabase.com/docs/guides/realtime |
| React Native (Expo) ドキュメント | https://docs.expo.dev/ |
| Recharts ドキュメント | https://recharts.org/en-US/ |
| Tailwind CSS ドキュメント | https://tailwindcss.com/docs |
| Twilio Voice API | https://www.twilio.com/docs/voice |
| OpenAI Whisper API | https://platform.openai.com/docs/guides/speech-to-text |
| OpenAI GPT-4o API | https://platform.openai.com/docs/guides/text-generation |
| Netlify デプロイ設定 | https://docs.netlify.com/frameworks/next-js/ |

---

> **本ドキュメントは、プロジェクトの進行に伴い継続的に更新されます。**
> *最終更新: 2026年3月16日 — Phase 3 設計完了・Supabase/LINE連携アーキテクチャを追加*
