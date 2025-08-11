# GitHub Navigator - プロジェクト概要

## プロジェクトの目的

GitHub NavigatorはPlasmoフレームワークを使用したChrome拡張機能です。効率的なGitHubナビゲーション機能を提供することを目的としています。

### 主な特徴

- Chrome拡張機能とNext.jsアプリのデュアル開発環境
- GitHub風UI/UXの実装
- 認証機能（OAuth）を含むGitHub API統合
- リポジトリ管理、Issues、Pull Requests、Actionsなど多機能

## 技術スタック

### コアフレームワーク

- **Plasmo**: v0.90.5 (Chrome拡張機能開発フレームワーク)
- **Next.js**: v15.4.2 (Webアプリケーションフレームワーク)
- **React**: v19.1.0 (UIライブラリ)
- **TypeScript**: v5.8.3

### UI/スタイリング

- **Tailwind CSS**: v4.1.11 (CSSフレームワーク)
- **shadcn/ui**: New York スタイル、46コンポーネント導入済み
- **Radix UI**: 基盤コンポーネントシステム
- **Lucide React**: v0.525.0 (アイコンライブラリ)
- **Octicons React**: v19.15.3 (GitHub公式アイコン)

### テーマ・デザインシステム

- **next-themes**: v0.4.6 (テーマ管理)
- **GitHub Primer**: デザインシステム適用済み
- **CSS Variables**: rem基準サイズシステム

### 開発・ビルドツール

- **pnpm**: v10.13.1 (パッケージマネージャー)
- **ESLint**: Flat Config形式、TypeScript + React + Next.js統合
- **Prettier**: インポート順序自動整理対応
- **Vitest**: テストフレームワーク
- **Husky**: Git hooks

### その他の主要依存関係

- **@plasmohq/storage**: Chrome拡張機能用ストレージ
- **react-hook-form**: フォーム管理
- **zod**: バリデーション
- **sonner**: 通知システム

## アーキテクチャ構成

### デュアル環境

1. **Chrome拡張機能**: `src/popup/index.tsx` → Plasmoビルド
2. **Next.jsアプリ**: `src/app/page.tsx` → Next.jsビルド
3. **共有コンポーネント**: `src/components/main.tsx`

### ディレクトリ構造

```
src/
├── popup/           # Chrome拡張機能エントリーポイント
├── app/             # Next.jsアプリケーション (App Router)
├── components/
│   ├── ui/          # shadcn/ui標準コンポーネント (46個)
│   ├── github/      # GitHub風カスタムコンポーネント (8個)
│   ├── layout/      # レイアウトコンポーネント
│   └── demo/        # ショーケース用コンポーネント
├── hooks/           # カスタムフック
├── lib/             # ユーティリティ・API・認証
└── styles/          # グローバルスタイル
```

## パッケージマネージャー

- **必須**: pnpm v10.13.1を使用（npm/yarnは使用しない）
- patchedDependencies: jiti, @tailwindcss/oxide
- オーバーライド設定済み
