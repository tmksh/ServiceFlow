# SaaS型 自動顧客管理ツール 開発指示書 (CLAUDE.md)

## 1. プロジェクト概要

不用品回収・引っ越し・ハウスクリーニング等の「一般消費者向け生活サービス業」に特化した、案件管理・スケジュール・売上分析を一元化するSaaSを開発します。

- **主要機能**: LINE連携による案件自動登録、カレンダー形式のスケジュール管理、リアルタイムの案件自動振り分け、ダッシュボードによる各種分析機能
- **対応デバイス**: スマートフォンアプリ（React Native）およびPC向けウェブアプリ（Next.js）
- **リファレンス**: @/home/ubuntu/analysis_notes.md

## 2. 技術スタック

- **フロントエンド (Web)**: Next.js, React, TypeScript, Tailwind CSS
- **フロントエンド (Mobile)**: React Native, Expo, TypeScript
- **バックエンド**: Node.js, Express, TypeScript
- **データベース**: MySQL
- **インフラ**: 未定（AWS or GCPを想定）
- **主要API**: LINE Messaging API, Google Calendar API (暫定)

## 3. コーディング規約

- **スタイル**: Prettierのデフォルト設定に従う。コミット時に自動フォーマットを実行する。
- **命名規則**: 変数・関数は`camelCase`、クラス・コンポーネントは`PascalCase`、ファイル名は`kebab-case`を基本とする。
- **モジュール**: ES Modules (`import/export`) を使用する。
- **型定義**: TypeScriptの型を積極的に活用し、`any`の使用は原則禁止とする。

## 4. ワークフローとコマンド

- **ブランチ戦略**: `main` (本番), `develop` (開発), `feature/issue-` (機能開発) のGit-flowを基本とする。
- **コミットメッセージ**: `feat: 新機能追加` `fix: バグ修正` `docs: ドキュメント更新` のようにConventional Commits規約に準拠する。
- **テスト**: `npm test`でJestによる単体テスト・結合テストを実行する。テストカバレッジは80%以上を目標とする。
- **リンター**: `npm run lint`でESLintによる静的解析を実行する。
- **ビルド**: `npm run build`で各アプリケーションのビルドを実行する。

## 5. 開発上の指示

- **検証方法**: 機能実装後は必ず関連するテストを作成・実行し、すべてのテストがパスすることを確認してください。UIの変更については、スクリーンショットを撮影し、意図したデザインと一致しているか検証してください。
- **進め方**: 不明瞭な点や大規模な変更が伴う場合は、まず調査・分析を行い、実装計画を立ててからコーディングに着手してください。（Explore first, then plan, then code）
- **コンテキスト管理**: 関連性のないタスクに切り替える際は、`/clear`コマンドでコンテキストをリセットしてください。
- **スキル活用**: 繰り返し発生するタスクやドメイン知識は、`/skills`を活用して再利用可能なスキルとして登録してください。

## 6. 参照ドキュメント

- **LINE Messaging API**: https://developers.line.biz/ja/docs/messaging-api/
- **Next.js**: https://nextjs.org/docs
- **React Native (Expo)**: https://docs.expo.dev/
