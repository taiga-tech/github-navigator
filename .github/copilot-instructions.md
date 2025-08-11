# Copilot Instructions for github-navigator

このリポジトリは Plasmo フレームワーク + Next.js/React を用いた Chrome 拡張機能 & Webアプリのデュアル構成です。AIエージェントが即戦力となるための重要な知識・ルールをまとめます。

## アーキテクチャ概要

- **Chrome拡張機能**: `src/popup/index.tsx`（ポップアップUI）
- **Webアプリ**: `src/app/page.tsx`（Next.js App Router）
- **共通UI**: `src/components/main.tsx`（両方で利用）
- **UIコンポーネント**: `src/components/ui/`（shadcn/ui 46種）、`src/components/github/`（GitHub風8種）
- **テーマ管理**: `src/components/providers.tsx`（next-themes）
- **状態管理**: useState, react-hook-form, next-themes, @plasmohq/storage
- **パスエイリアス**: `@/components`, `@/lib`, `@/hooks` など（tsconfig.json, components.json参照）

## 開発・ビルド・テスト

- **開発サーバー起動**: `pnpm dev`（Plasmo: localhost:3000, Next.js: localhost:1947）
- **拡張機能テスト**: `build/chrome-mv3-dev` を Chrome で読み込み
- **本番ビルド**: `pnpm build`（両方）、`pnpm build:plasmo`（拡張機能のみ）、`pnpm build:next`（Webアプリのみ）
- **型チェック**: `pnpm typecheck`
- **ESLint**: `pnpm lint`（Flat Config, TypeScript/React/Next.js統合）、`pnpm lint:fix`
- **Prettier**: `pnpm format`（インポート順序/Tailwindクラス順自動整理）
- **テスト**: `pnpm test`, `pnpm test:watch`, `pnpm test:ui`, `pnpm test:coverage`

## UI/コンポーネント実装ルール

- **shadcn/ui追加**: `pnpm dlx shadcn@latest add [component-name]`（components.json参照）
- **React.memo/useCallback/useMemo**: 頻繁に再レンダリング・重い計算・リスト描画時は必須
- **単一責任/粒度分割**: 100行超は分割検討
- **プロップドリリング回避**: 深い階層はContext API活用
- **CSS制約**: Flexbox/Grid/Tailwind優先、`absolute`/`fixed`/`sticky`は最小限
- **GitHub Primerデザイン**: CSS変数・カラーパレット（ライト/ダーク）を `src/styles/globals.css` で管理
- **Octicons/Lucide**: アイコンは公式Reactパッケージ利用

## 状態管理・永続化

- **ローカル**: useState, react-hook-form
- **グローバル**: next-themes（テーマ）、Context API（限定的）
- **永続化**: @plasmohq/storage（Chrome拡張用）
- **拡張戦略**: useState → Context → Zustand/Jotai → React Query（必要に応じて段階的導入）
- **Chrome API連携**: `chrome.tabs.query` などは `useEffect` で取得

## 依存・パッチ

- **主要依存**: Plasmo, Next.js, React, Tailwind, shadcn/ui, Lucide, Octicons, react-hook-form, zod, sonner, recharts, date-fns など
- **パッチ適用**: `patches/` ディレクトリ（jiti, @tailwindcss/oxide）

## 参考ファイル

- `CLAUDE.md`（日本語詳細ガイド）
- `README.md`（Plasmo/Next.js開発手順）
- `components.json`（shadcn/ui設定）
- `tsconfig.json`（パスエイリアス）
- `src/styles/globals.css`（CSS変数/テーマ）

---

不明点・追加したいルールがあればご指摘ください。内容は随時アップデート可能です。
