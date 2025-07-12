# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 必須事項

- 回答は全て日本語で行ってください。
- 起動時に以下の内容を読み込んでください。
- コードの変更は、以下のプロジェクト概要と技術スタックに基づいて行ってください。
- 重要な指示や構造の変更があった場合は、必ずその指示に従ってCLAUDE.mdの内容を更新してください。

## プロジェクト概要

このプロジェクトは、Plasmoフレームワークを使用したChrome拡張機能「Github navigator」です。Plasmo v0.90.5とNext.js 15.3.5、React 19.1.0を組み合わせて、モダンなReactベースの拡張機能を構築しています。

### 技術スタック

- **フレームワーク**: Plasmo v0.90.5（Chrome拡張機能開発）
- **UI**: React 19.1.0 + Next.js 15.3.5
- **スタイリング**: Tailwind CSS v4.1.11
- **UI コンポーネントシステム**: shadcn/ui（New York スタイル、45コンポーネント導入済み）
- **リサイザブル**: react-resizable-panels v3.0.3
- **ベースコンポーネント**: Radix UI（Dialog, Popover, Scroll Area, Tabs等）
- **アイコン**: Lucide React v0.525.0
- **テーマ管理**: next-themes v0.4.6（システム/ダーク/ライトモード対応）
- **コマンドパレット**: cmdk v1.1.1
- **チャート**: recharts v2.15.4
- **日付処理**: date-fns v4.1.0
- **フォーム管理**: react-hook-form v7.60.0 + hookform/resolvers v5.1.1
- **通知**: sonner v2.0.6
- **バリデーション**: zod v4.0.5
- **カルーセル**: embla-carousel-react v8.6.0
- **ドロワー**: vaul v1.1.2
- **OTP入力**: input-otp v1.4.2
- **ユーティリティ**: clsx v2.1.1 + tailwind-merge v3.3.1
- **TypeScript**: v5.8.3
- **パッケージマネージャー**: pnpm v10.13.1

## 開発コマンド

**重要**: 全てのコマンドは pnpm を使用してください。

### 開発環境の起動

```bash
pnpm dev
```

Plasmoの開発サーバー（ポート3000）とNext.jsの開発サーバー（ポート1947）を並行して起動します。

### ビルド

```bash
pnpm build
```

Plasmoと Next.jsの両方の本番ビルドを作成します。拡張機能は `build/chrome-mv3-prod` に出力されます。

### 型チェック

```bash
pnpm exec tsc --noEmit
```

### コードフォーマット

```bash
pnpm format
```

または手動で：

```bash
pnpm exec prettier --write .
```

### ESLint

設定ファイル: `eslint.config.js`

- TypeScript/TSXファイル用のルール設定
- 未使用変数の検出（`_` プレフィックスで無視可能）
- Chrome拡張機能用のグローバル変数設定済み

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

- **スタイル**: New York
- **ベースカラー**: neutral
- **CSS変数**: 有効
- **アイコンライブラリ**: Lucide React
- **インストール先**: `src/components/ui/`
- **ユーティリティ**: `src/lib/utils.ts` (cn関数)

## アーキテクチャ

### ファイル構造

- `src/popup/index.tsx` - 拡張機能のポップアップエントリーポイント
- `src/components/main.tsx` - メインコンポーネント（ポップアップとNext.jsアプリで共有）
- `src/components/providers.tsx` - テーマプロバイダー（next-themes）
- `src/components/ui/` - shadcn/ui コンポーネント（46コンポーネント導入済み）
- `src/hooks/use-mobile.ts` - モバイル検出カスタムフック
- `src/lib/utils.ts` - ユーティリティ関数（cn関数など）
- `src/app/` - Next.jsアプリケーション用ディレクトリ
- `src/styles/globals.css` - グローバルスタイル（Tailwind CSS設定含む）
- `components.json` - shadcn/ui設定ファイル
- `tsconfig.json` - TypeScript設定（Plasmoのベース設定を拡張）

### 開発の流れ

1. **ポップアップUI編集**: `src/popup/index.tsx` または `src/components/main.tsx` を編集
2. **新しいUIコンポーネント追加**: `pnpm dlx shadcn@latest add [component-name]` でコンポーネントを追加
3. **オプションページ追加**: プロジェクトルートに `options.tsx` を作成
4. **コンテンツスクリプト追加**: プロジェクトルートに `content.ts` を作成
5. **開発テスト**: `build/chrome-mv3-dev` ディレクトリを Chrome で読み込み

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

- **Prettier**: インポート順序の自動整理、Tailwind CSSクラス順序
- **ESLint**: TypeScript用ルール、Chrome拡張機能API対応
- **TypeScript**: Plasmoベース設定を拡張、Next.jsプラグイン使用

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
- 依存関係の一部（jiti、@tailwindcss/oxide）にパッチが適用されている（pnpm patches）

### 利用可能なshadcn/uiコンポーネント

現在45のコンポーネントが導入済み：

- **基本**: Button, Badge, Avatar, Separator, Skeleton等
- **フォーム**: Input, Textarea, Select, Checkbox, Switch, Slider等
- **ナビゲーション**: Breadcrumb, Pagination, Tabs, Command等
- **表示**: Card, Alert, Dialog, Popover, Tooltip, Table, Calendar, Carousel等
- **レイアウト**: ScrollArea, Resizable, Collapsible, Sidebar, Sheet, Drawer等
- **入力**: Input, Textarea, Select, Checkbox, Switch, Slider, InputOTP等
- **フィードバック**: Progress, Alert, Sonner（トースト通知）等

新しいコンポーネントが必要な場合は `pnpm dlx shadcn@latest add [component-name]` で追加可能。

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
- **react-hook-form**: フォーム状態管理（v7.59.0）

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

## 実装ログ

すべての実装変更は`.claude/logs/`ディレクトリに記録してください。

ログファイル命名規則：`YYYY-MM-DD_HH-MM-SS_brief-description.md`

例：`2024-01-15_14-30-00_add-notification-system.md`
