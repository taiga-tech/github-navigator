# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 必須事項

- 回答は全て日本語で行ってください。
- コードの変更は、以下のプロジェクト概要と技術スタックに基づいて行ってください。

## プロジェクト概要

このプロジェクトは、Plasmoフレームワークを使用したChrome拡張機能「Github navigator」です。Plasmo v0.90.5とNext.js 15.4.2、React 19.1.0を組み合わせて、モダンなReactベースの拡張機能を構築しています。

### 技術スタック

- **フレームワーク**: Plasmo v0.90.5（Chrome拡張機能開発）
- **UI**: React 19.1.0 + Next.js 15.4.2
- **スタイリング**: Tailwind CSS v4.1.11 + tw-animate-css v1.3.5
- **UI コンポーネントシステム**: shadcn/ui（New York スタイル、46コンポーネント導入済み）
- **リサイザブル**: react-resizable-panels v3.0.3
- **ベースコンポーネント**: Radix UI（Dialog, Popover, Scroll Area, Tabs等）
- **アイコン**: Lucide React v0.525.0 + Octicons React v19.15.3（GitHub公式）
- **テーマ管理**: next-themes v0.4.6（システム/ダーク/ライトモード対応）
- **コマンドパレット**: cmdk v1.1.1
- **チャート**: recharts v2.15.4
- **日付処理**: date-fns v4.1.0 + react-day-picker v9.8.0
- **フォーム管理**: react-hook-form v7.60.0 + hookform/resolvers v5.1.1
- **通知**: sonner v2.0.6
- **バリデーション**: zod v4.0.5
- **カルーセル**: embla-carousel-react v8.6.0
- **ドロワー**: vaul v1.1.2
- **OTP入力**: input-otp v1.4.2
- **ユーティリティ**: clsx v2.1.1 + tailwind-merge v3.3.1 + class-variance-authority v0.7.1
- **TypeScript**: v5.8.3
- **パッケージマネージャー**: pnpm v10.13.1

## 開発コマンド

**重要**: 全てのコマンドは pnpm を使用してください。

### デュアル開発サーバー

```bash
pnpm dev
```

以下を並行実行：

- **Plasmo開発サーバー**: `localhost:3000` (Chrome拡張機能)
- **Next.js開発サーバー**: `localhost:1947` (Webアプリ)

拡張機能のテストは `build/chrome-mv3-dev` をChromeで読み込み。

### ビルド

```bash
# 本番ビルド（拡張機能 + Next.jsアプリ）
pnpm build

# 個別ビルド
pnpm build:plasmo  # 拡張機能のみ → build/chrome-mv3-prod
pnpm build:next    # Next.jsアプリのみ
```

### コード品質チェック

```bash
# TypeScript型チェック
pnpm typecheck

# ESLint（設定：eslint.config.js）
pnpm lint          # チェックのみ
pnpm lint:fix      # 自動修正

# Prettier（自動インポート順序整理）
pnpm format        # 全ファイル
```

#### ESLint設定詳細

現在の設定は Flat Config 形式で以下のルールを統合：

- **基本**: @eslint/js推奨設定
- **TypeScript**: typescript-eslint推奨設定、未使用変数エラー
- **React**: eslint-plugin-react、JSXスコープ不要設定
- **React Hooks**: exhaustive-deps エラー設定
- **Next.js**: core-web-vitals対応
- **Prettier**: コード整形との競合回避（eslint-config-prettier）

主要なカスタムルール：

- `@typescript-eslint/no-unused-vars`: アンダースコア接頭辞で無視
- `react/react-in-jsx-scope`: 新JSX変換により無効
- `react-hooks/exhaustive-deps`: エラーレベル

### Next.jsサーバー

```bash
# 本番サーバー起動
pnpm start
```

### テスト

```bash
# テスト実行
pnpm test           # テスト実行
pnpm test:watch     # ウォッチモード
pnpm test:ui        # UI付きテスト実行
pnpm test:coverage  # カバレッジ計測

# 型チェックと品質チェック
pnpm typecheck      # TypeScript型チェック
pnpm lint           # ESLintチェック
```

### shadcn/ui コンポーネント追加

このプロジェクトは shadcn/ui が設定済みです。新しいコンポーネントを追加する手順：

#### 利用可能なコンポーネント一覧を確認

```bash
pnpm dlx shadcn@latest add
```

#### 特定のコンポーネントを追加

```bash
pnpm dlx shadcn@latest add [component-name]
```

例：

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add badge
```

#### 複数コンポーネントの同時追加

```bash
pnpm dlx shadcn@latest add button card badge
```

#### 既存コンポーネントを上書き更新

```bash
pnpm dlx shadcn@latest add button --overwrite
```

#### 現在の設定

- **スタイル**: new-york
- **RSC**: 有効（React Server Components対応）
- **TSX**: 有効
- **ベースカラー**: neutral
- **CSS変数**: 有効
- **アイコンライブラリ**: lucide
- **CSS ファイル**: `src/styles/globals.css`
- **インストール先**: `@/components/ui/`
- **ユーティリティ**: `@/lib/utils` (cn関数)

## アーキテクチャ

### ファイル構造

- `src/popup/index.tsx` - 拡張機能のポップアップエントリーポイント
- `src/components/main.tsx` - メインコンポーネント（ポップアップとNext.jsアプリで共有）
- `src/components/providers.tsx` - テーマプロバイダー（next-themes）
- `src/components/ui/` - shadcn/ui コンポーネント（46コンポーネント導入済み）
- `src/components/github/` - GitHub風カスタムコンポーネント（8コンポーネント）
- `src/components/demo/` - デモ用ショーケース（4コンポーネント）
- `src/hooks/use-mobile.ts` - モバイル検出カスタムフック
- `src/lib/utils.ts` - ユーティリティ関数（cn関数など）
- `src/app/` - Next.jsアプリケーション用ディレクトリ（App Router対応、layout.tsx/page.tsx）
- `src/styles/globals.css` - グローバルスタイル（Tailwind CSS設定含む）
- `components.json` - shadcn/ui設定ファイル
- `tsconfig.json` - TypeScript設定（Plasmoのベース設定を拡張）

### 開発の流れ

1. **ポップアップUI編集**: `src/popup/index.tsx` または `src/components/main.tsx` を編集
2. **新しいUIコンポーネント追加**: `pnpm dlx shadcn@latest add [component-name]` でコンポーネントを追加
3. **オプションページ追加**: プロジェクトルートに `options.tsx` を作成
4. **コンテンツスクリプト追加**: プロジェクトルートに `content.ts` を作成
5. **開発テスト**: `build/chrome-mv3-dev` ディレクトリを Chrome で読み込み

### コンポーネントの実装指針

- **React.memo**: 頻繁に再レンダリングされるコンポーネントには必須
- **useCallback/useMemo**: 重い計算やオブジェクト生成時に使用
- **単一責任の原則**: 1つのコンポーネントは1つの責任のみ
- **プロップドリリング回避**: 深い階層へのprops渡しは避ける

### 重要な設定

#### パス解決

TypeScript (`tsconfig.json`) とshadcn/ui (`components.json`) で以下のパスエイリアスが設定されています：

- `@/*` → `src/` ディレクトリ（TypeScript）
- `@/components` → `src/components/` （shadcn/ui）
- `@/components/ui` → `src/components/ui/` （shadcn/ui コンポーネント）
- `@/lib/utils` → `src/lib/utils.ts` （ユーティリティ関数）
- `@/lib` → `src/lib/` （ライブラリ）
- `@/hooks` → `src/hooks/` （カスタムフック）
- `~*` → Plasmoの `src/` ディレクトリ参照プレフィックス

#### 拡張機能の権限

- `tabs`: タブアクセス権限
- `https://*/*`: 全HTTPSサイトでの実行権限

#### コード品質設定

- **Prettier**: インポート順序の自動整理、Tailwind CSSクラス順序（@trivago/prettier-plugin-sort-imports）
- **ESLint**: Flat Config形式、TypeScript + React + Next.js統合ルール、Chrome拡張機能API対応
- **TypeScript**: v5.8.3、Plasmo templates/tsconfig.base拡張、Next.jsプラグイン、isolatedModules有効

### Plasmo フレームワークの特徴

従来のChrome拡張機能開発との主な違い：

- **ファイル名ベースルーティング**: `popup.tsx`, `options.tsx`, `content.ts` を自動認識
- **自動マニフェスト生成**: `package.json` の設定から manifest.json を生成
- **ホットリロード**: 開発中の自動リロード対応
- **React/TypeScript完全対応**: 最新のWeb技術スタック使用可能
- **デュアル開発サーバー**: 拡張機能とNext.jsアプリの並行開発

### 開発時の注意点

- 拡張機能のテストは `build/chrome-mv3-dev` ディレクトリを Chrome で読み込み
- Next.jsアプリは `http://localhost:1947` でアクセス可能
- インポート順序はPrettierで自動整理される（React/Next.js → サードパーティ → Plasmo → 内部モジュール → 相対パス）
- 依存関係の一部（jiti、@tailwindcss/oxide）にパッチが適用されている（pnpm patches、pnpm-workspace.yaml管理）

### 利用可能なshadcn/uiコンポーネント

現在46のコンポーネントが導入済み：

**基本コンポーネント:**

- Avatar, Badge, Button, Card, Separator, Skeleton

**フォーム・入力:**

- Checkbox, Form, Input, Input-OTP, Label, Radio-Group, Select, Slider, Switch, Textarea, Toggle, Toggle-Group

**ナビゲーション:**

- Breadcrumb, Command, Menubar, Navigation-Menu, Pagination, Tabs

**レイアウト:**

- Accordion, Aspect-Ratio, Collapsible, Resizable, Scroll-Area, Sheet, Sidebar

**ダイアログ・オーバーレイ:**

- Alert-Dialog, Context-Menu, Dialog, Drawer, Dropdown-Menu, Hover-Card, Popover, Tooltip

**表示・フィードバック:**

- Alert, Calendar, Carousel, Chart, Progress, Sonner, Table

**その他:**

- PostCSS, Tailwind CSS連携済み

### GitHubコンポーネント（8コンポーネント）

`src/components/github/` に実装済み：

- **Alert**: GitHub風アラートコンポーネント（success/warning/danger/info）
- **Button**: GitHub風ボタン（primary/secondary/outline/danger）
- **Card**: GitHub風カード（ステータス表示対応）
- **ColorSwatch**: カラーパレット表示
- **FileExplorer**: ファイルツリー表示（Octicons使用）
- **IssueItem**: Issue一覧アイテム（ラベル、ステータス）
- **RepoCard**: リポジトリカード（言語、スター数、visibility）
- **ThemeToggle**: ダーク/ライトモード切り替え（SSR対応）

新しいコンポーネントが必要な場合は `pnpm dlx shadcn@latest add [component-name]` で追加可能。

## GitHub Primerデザインシステム設定

このプロジェクトは、GitHub公式のPrimerデザインシステムを適用済みです。

### カラーパレット

**ライトテーマ:**

- Background: `#ffffff` (白)
- Foreground: `#1f2328` (ダークグレー)
- Primary: `#0969da` (ブルー)
- Card: `#f6f8fa` (ライトグレー)
- Border: `#d1d9e0` (グレー)

**ダークテーマ:**

- Background: `#0d1117` (ダーク)
- Foreground: `#f0f6fc` (ライト)
- Primary: `#58a6ff` (ライトブルー)
- Card: `#161b22` (ダークグレー)
- Border: `#30363d` (グレー)

### Octiconsアイコン使用法

GitHub公式のOcticonsアイコンを使用可能：

```tsx
import { MarkGithubIcon, StarFillIcon, RepoIcon } from "@primer/octicons-react";

<MarkGithubIcon size={16} />
<StarFillIcon size={16} fill="var(--color-warning)" />
<RepoIcon size={24} />
```

### GitHubスタイルボタンの例

```tsx
// プライマリボタン
<button className="px-4 py-2 rounded-md font-medium text-[15px]
                   bg-[hsl(var(--color-primary))]
                   text-[hsl(var(--color-primary-foreground))]
                   hover:bg-[hsl(var(--color-primary)/0.9)]">
  Commit changes
</button>

// セカンダリボタン
<button className="px-4 py-2 rounded-md font-medium text-[15px]
                   bg-[hsl(var(--color-secondary))]
                   text-[hsl(var(--color-secondary-foreground))]
                   border border-[hsl(var(--color-border))]
                   hover:bg-[hsl(var(--color-muted))]">
  Cancel
</button>
```

### CSS変数アーキテクチャ

**rem基準サイズシステム**

すべてのサイズ値がrem単位で統一済み：

```css
/* フォントサイズ */
--font-size-xs: 0.6875rem; /* 11px */
--font-size-sm: 0.75rem; /* 12px */
--font-size-base: 0.875rem; /* 14px */
--font-size-lg: 1rem; /* 16px */

/* スペーシング */
--space-2: 0.125rem; /* 2px */
--space-4: 0.25rem; /* 4px */
--space-8: 0.5rem; /* 8px */
--space-16: 1rem; /* 16px */

/* ボーダー半径 */
--radius-sm: 0.375rem; /* 6px */
--radius-md: 0.625rem; /* 10px */
--radius-lg: 0.75rem; /* 12px */

/* レイアウト */
--container-lg: 64rem; /* 1024px */
--container-xl: 80rem; /* 1280px */
```

### 8px基準スペーシング

GitHub風のスペーシングを使用：

- `gap-2` (0.5rem / 8px)
- `gap-3` (0.75rem / 12px)
- `gap-4` (1rem / 16px)
- `rounded-md` (0.375rem / 6px) を統一

## UI実装時の重要なルール

### CSS ポジショニング制限

- `relative`、`absolute`、`fixed`、`sticky`の使用は極力避けてください
- Flexbox、Grid、Tailwind CSSのスペーシングユーティリティを活用してレイアウトを構築
- 絶対に固定しないといけない場合のみ positioning を使用（例：モーダルオーバーレイ）

**推奨するレイアウト手法:**

```tsx
// 良い例：FlexboxとTailwindクラスを使用
<div className="flex items-center justify-between">
    <div className="flex-1 space-y-2">
        {/* コンテンツ */}
    </div>
</div>

// 良い例：Gridレイアウトを使用
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* アイテム */}
</div>

// 避けるべき例：不要なabsolute positioning
<div className="relative">
    <div className="absolute top-4 right-4"> {/* 避ける */}
        {/* コンテンツ */}
    </div>
</div>
```

## React パフォーマンス最適化ルール

### メモ化の必須パターン

```tsx
// コンポーネントレベルのメモ化
export const MyComponent = memo(({ prop1, prop2 }) => {
    // コンポーネント実装
})

// コールバック関数のメモ化
const handleClick = useCallback(
    (item) => {
        // イベントハンドラー実装
    },
    [dependency]
)

// 計算値のメモ化
const computedValue = useMemo(() => {
    return expensiveCalculation(data)
}, [data])

// オブジェクト/配列のメモ化
const config = useMemo(
    () => ({
        option1: value1,
        option2: value2,
    }),
    [value1, value2]
)
```

### コンポーネント分割の原則

- **単一責任**: 1つのコンポーネントは1つの責任のみ
- **適切な粒度**: 100行を超える場合は分割を検討
- **状態の局所化**: 状態は使用する最小のスコープで管理
- **プロップドリリング回避**: 深い階層への props 渡しは避ける

### メモ化が必要なケース

- リスト内のアイテムコンポーネント（`map`で描画される要素）
- 親コンポーネントが頻繁に再レンダリングされる場合
- 重い計算処理を含むコンポーネント
- 複雑なオブジェクトや配列を props として受け取る場合

## 状態管理

### 現在の状態管理方式

プロジェクトは現在、シンプルな状態管理構成を採用しています：

**ローカル状態管理:**

- **React標準のuseState**: コンポーネント内の基本的な状態管理
- **react-hook-form**: フォーム状態管理（v7.60.0）

**グローバル状態管理:**

- **next-themes**: テーマ切り替え（システム/ダーク/ライトモード）
- **Context API**: shadcn/uiコンポーネント内で限定的に使用

**永続化:**

- **@plasmohq/storage**: Chrome拡張機能用ストレージ（v1.15.0、導入済み）

### 状態管理の実装パターン

```tsx
// ローカル状態管理
const [data, setData] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// テーマ管理（グローバル）
<NextThemesProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
>
    {children}
</NextThemesProvider>

// Chrome Storage使用例（推奨パターン）
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

// データ保存
await storage.set("key", value)

// データ取得
const value = await storage.get("key")

// 変更監視
storage.watch({
    "key": (c) => {
        // 変更時の処理
    }
})
```

### コンポーネント間での状態共有

**現在の方法:**

- **プロップドリリング**: 親から子への状態受け渡し
- **Context API**: UIコンポーネント内での限定的な使用

**推奨パターン（将来的な拡張時）:**

```tsx
// Context APIを使用したグローバル状態管理
const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }) => {
    const [state, setState] = useState<AppState>(initialState)

    return (
        <AppContext.Provider value={{ state, setState }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppState = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppState must be used within AppProvider')
    }
    return context
}
```

### Chrome拡張機能特有の状態管理

**デュアル環境での状態共有:**

```tsx
// ポップアップとNext.jsアプリ間での状態同期
const syncState = async (key: string, value: any) => {
    // Chrome Storageに保存
    await storage.set(key, value)

    // 他の環境に通知（メッセージパッシング）
    chrome.runtime.sendMessage({
        type: 'STATE_UPDATE',
        key,
        value,
    })
}
```

**拡張機能権限を活用した状態管理:**

```tsx
// タブ情報の取得と状態管理
const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null)

useEffect(() => {
    const getCurrentTab = async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        })
        setActiveTab(tab)
    }
    getCurrentTab()
}, [])
```

### 非同期状態管理パターン

```tsx
// API呼び出しの状態管理
const useAsyncState = <T>(asyncFn: () => Promise<T>) => {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const execute = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await asyncFn()
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [asyncFn])

    return { data, loading, error, execute }
}
```

### 状態管理のベストプラクティス

**Zustandパターン（フェーズ2での導入時）:**

```typescript
// 非同期アクションでのエラーハンドリング
const action = async () => {
    try {
        set({ isLoading: true, error: null })
        const result = await apiCall()
        set({ data: result, isLoading: false })
    } catch (error) {
        set({ error: error.message, isLoading: false })
    }
}

// 状態の部分更新
set((state) => ({ ...state, newProperty: value }))
```

**Chrome拡張機能での状態永続化パターン:**

```typescript
// Plasmo Storage + Zustand組み合わせ例
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Storage } from '@plasmohq/storage'

const storage = new Storage()

const useStore = create(
    persist(
        (set, get) => ({
            // 状態定義
            user: null,
            settings: {},

            // アクション
            setUser: (user) => set({ user }),
            updateSettings: (settings) =>
                set((state) => ({
                    settings: { ...state.settings, ...settings },
                })),
        }),
        {
            name: 'app-storage',
            storage: {
                getItem: async (name) => await storage.get(name),
                setItem: async (name, value) => await storage.set(name, value),
                removeItem: async (name) => await storage.remove(name),
            },
        }
    )
)
```

### 状態管理の拡張戦略

プロジェクトの成長に合わせた段階的な拡張：

1. **フェーズ1（現在）**: useState + Context API + Plasmo Storage
2. **フェーズ2**: Zustand/Jotaiの導入（複雑な状態管理が必要になった場合）
3. **フェーズ3**: React Query/SWRの導入（API統合が本格化した場合）

## アーキテクチャの重要なポイント

### デュアル開発環境

このプロジェクトの最大の特徴は、Chrome拡張機能とNext.jsアプリが同時に動作することです：

- **拡張機能**: `src/popup/index.tsx` → Chrome拡張のポップアップ
- **Webアプリ**: `src/app/page.tsx` → Next.jsのWebアプリ（App Router、metadata API対応）
- **共有UI**: `src/components/main.tsx` → 両方で使用される共通コンポーネント

### コンポーネント構成

```
src/components/
├── ui/              # shadcn/ui標準コンポーネント（46個）
├── github/          # GitHub風カスタムコンポーネント（8個）
├── demo/            # ショーケース用（4個）
├── main.tsx         # 共有メインコンポーネント
└── providers.tsx    # テーマプロバイダー
```

### GitHub Primerデザインシステム

完全なGitHub Primerカラーパレットが実装済み。CSS変数による動的テーマ切り替えに対応：

- ライトテーマ：`#ffffff` background, `#0969da` primary
- ダークテーマ：`#0d1117` background, `#58a6ff` primary

### 状態管理のアプローチ

現在は軽量な構成を採用：

- **ローカル**: React useState + react-hook-form
- **グローバル**: next-themes（テーマ管理）
- **永続化**: @plasmohq/storage（Chrome拡張用）

複雑になった場合の拡張戦略：useState → Context API → Zustand → React Query

## 開発時のベストプラクティス

### パフォーマンス最適化

```tsx
// 必須：コンポーネントのメモ化
export const Component = memo(({ prop }) => {
    /* ... */
})

// 必須：重い計算のメモ化
const value = useMemo(() => expensiveCalc(data), [data])

// 必須：イベントハンドラーのメモ化
const handler = useCallback(
    (e) => {
        /* ... */
    },
    [deps]
)
```

### CSS制約

- `absolute`, `fixed`, `sticky`の使用は最小限に
- Flexbox, Gridレイアウトを優先
- Tailwind CSSユーティリティクラスを活用

### Chrome拡張機能特有の制約

```tsx
// Storage API使用例
import { Storage } from '@plasmohq/storage'

// タブ情報の取得
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

const storage = new Storage()
await storage.set('key', value)
```
