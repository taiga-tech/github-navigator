# 技術スタック

## コアフレームワーク

- **Plasmo v0.90.5**: Manifest V3対応のChrome拡張機能フレームワーク
- **React 19**: 最新機能を備えたUIライブラリ
- **TypeScript 5.8.3**: 型安全な開発
- **Next.js 15.4.2**: フルスタックReactフレームワーク（デモ/ランディングページ用）

## スタイリング & UI

- **Tailwind CSS v4.1.11**: カスタムGitHubテーマ付きのユーティリティファーストCSSフレームワーク
- **shadcn/ui**: Radix UIベースの高品質Reactコンポーネント
- **Radix UI**: アクセシブルで非スタイル化されたUIプリミティブ
- **Lucide React v0.525.0**: アイコンライブラリ
- **@primer/octicons-react v19.15.3**: Githubアイコンライブラリ
- **next-themes v0.4.6**: ダーク/ライトテーマ管理
- **react-hook-form v7.60.0**: フォーム状態管理
- **sonner v2.0.6**: トースト通知
- **zod v4.0.5**: バリデーション
- **recharts v2.15.4**: チャート
- **react-day-picker v9.8.0**: 日付ピッカー
- **embla-carousel-react v8.6.0**: カルーセル
- **vaul v1.1.2**: ドロワー
- **input-otp v1.4.2**: OTP入力
- **cmdk v1.1.1**: コマンドパレット
- **react-resizable-panels v3.0.3**: リサイザブルパネル

## 開発ツール

- **pnpm**: パッケージマネージャー（v10.13.1）
- **ESLint**: TypeScriptサポート付きコードリンティング（Flat Config）
- **Prettier**: インポートソート付きコードフォーマッティング
- **TypeScript**: 静的型チェック
- **Husky v9.1.7**: Git pre-commitフック（コード品質自動チェック）

## Chrome拡張機能API

- **Plasmo Storage API**: 拡張機能間ストレージ管理
- **Plasmo Messaging API**: バックグラウンドスクリプト通信
- **Chrome Identity API**: OAuth認証
- **Chrome Notifications API**: デスクトップ通知
- **Chrome Alarms API**: バックグラウンドタスクスケジューリング

## 共通コマンド

### 開発

```bash
# 開発サーバーを開始（拡張機能とNext.js両方）
pnpm dev

# 拡張機能開発のみ開始
pnpm dev:plasmo

# Next.js開発のみ開始
pnpm dev:next
```

### ビルド

```bash
# 拡張機能とNext.jsアプリ両方をビルド
pnpm build

# 拡張機能のみビルド
pnpm build:plasmo

# Next.jsアプリのみビルド
pnpm build:next
```

### コード品質

```bash
# 全コードをフォーマット
pnpm format

# コードをリント
pnpm lint

# リントして問題を修正
pnpm lint:fix
```

### 拡張機能の読み込み

- 開発ビルドの場所: `build/chrome-mv3-dev`
- 本番ビルドの場所: `build/chrome-mv3-prod`
- 適切なビルドディレクトリからChromeに未パッケージ拡張機能を読み込み

## アーキテクチャ注記

- 高速ビルドのためParcelバンドラー（Plasmo経由）を使用
- 開発中のホットリロードをサポート
- サービスワーカーバックグラウンドスクリプト付きManifest V3準拠
- パスエイリアス設定: `@/*` は `./src/*` にマップ
