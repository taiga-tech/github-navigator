# コードベースアーキテクチャ

## アーキテクチャ概要

GitHub Navigatorはデュアル環境アーキテクチャを採用しており、Chrome拡張機能とNext.jsアプリが並行動作する構成になっています。

### デュアル環境構成

#### 1. Chrome拡張機能環境

- **エントリーポイント**: `src/popup/index.tsx`
- **ビルド出力**: `build/chrome-mv3-dev`（開発）/ `build/chrome-mv3-prod`（本番）
- **開発サーバー**: `localhost:3000`（Plasmo）
- **用途**: ブラウザポップアップUI、GitHub統合機能

#### 2. Next.jsアプリ環境

- **エントリーポイント**: `src/app/page.tsx`
- **ビルド出力**: `.next/`
- **開発サーバー**: `localhost:1947`
- **用途**: Web版アプリケーション、開発・デバッグ用

#### 3. 共有コンポーネント層

- **中核**: `src/components/main.tsx`
- **役割**: 両環境で同一UIを提供
- **構成**: レイアウト、ビジネスロジック、状態管理

## ディレクトリ構造詳細

```
src/
├── popup/                 # Chrome拡張機能エントリー
│   └── index.tsx         # Plasmoポップアップ
├── app/                  # Next.js App Router
│   ├── layout.tsx        # ルートレイアウト
│   └── page.tsx          # メインページ
├── components/           # React コンポーネント
│   ├── ui/              # shadcn/ui標準コンポーネント（46個）
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── github/          # GitHub風カスタムコンポーネント（8個）
│   │   ├── header.tsx
│   │   ├── auth.tsx
│   │   ├── repo-card.tsx
│   │   └── ...
│   ├── layout/          # レイアウト系コンポーネント
│   │   ├── main-layout.tsx
│   │   ├── sidebar-navigation.tsx
│   │   └── ...
│   ├── demo/            # ショーケース用（4個）
│   ├── main.tsx         # 共有メインコンポーネント
│   └── providers.tsx    # グローバルプロバイダー
├── hooks/               # カスタムフック
│   ├── use-auth.ts
│   ├── use-user.ts
│   └── use-mobile.ts
├── lib/                 # ユーティリティ・API・認証
│   ├── auth.ts          # 認証ロジック
│   ├── github-api.ts    # GitHub API統合
│   ├── schemas.ts       # Zodスキーマ定義
│   ├── utils.ts         # 共通ユーティリティ
│   └── __tests__/       # テストファイル
└── styles/              # スタイルファイル
    └── globals.css      # Tailwind CSS設定
```

## コンポーネントアーキテクチャ

### 階層構造

```
Main (src/components/main.tsx)
├── Providers (テーマ、認証プロバイダー)
├── PopupContainer (拡張機能用コンテナ)
└── AuthGuard (認証ガード)
    ├── AuthComponent (未認証時)
    └── AuthenticatedContent (認証後)
        ├── Header
        └── MainLayout
            ├── mainContent (メインコンテンツ)
            └── sidebarContent (サイドバーナビ)
```

### コンポーネント分類

#### 1. UIコンポーネント（shadcn/ui）

- **基本**: Button, Card, Badge, Avatar, Separator, Skeleton
- **フォーム**: Input, Textarea, Select, Checkbox, Switch, Form
- **レイアウト**: Accordion, Tabs, Sidebar, Resizable, Scroll-Area
- **オーバーレイ**: Dialog, Sheet, Popover, Tooltip, Alert-Dialog

#### 2. GitHub風コンポーネント

- **認証**: AuthComponent, UserAvatar
- **UI**: Header, Button, Card, Alert
- **機能**: RepoCard, FileExplorer, IssueItem, ColorSwatch

#### 3. レイアウトコンポーネント

- **MainLayout**: 2:1比率でメイン:サイドバー構成
- **PopupContainer**: Chrome拡張機能用固定サイズコンテナ
- **SidebarNavigation**: 垂直タブナビゲーション

## 状態管理アーキテクチャ

### 現在の状態管理構成

```typescript
// ローカル状態
const [activeTab, setActiveTab] = useState<string>('dashboard')

// グローバル状態（テーマ）
<NextThemesProvider defaultTheme="system">

// 永続化状態（Chrome Storage）
const storage = new Storage()
await storage.set('key', value)
```

### 状態の分類

1. **UI状態**: コンポーネント内useState
2. **テーマ状態**: next-themes グローバル管理
3. **認証状態**: カスタムフック（use-auth.ts）
4. **ユーザーデータ**: Chrome Storage永続化
5. **フォーム状態**: react-hook-form

## データフロー

### 認証フロー

```
1. ユーザーアクセス
2. AuthGuard チェック
3. 未認証 → AuthComponent 表示
4. GitHub OAuth → 認証処理
5. 認証成功 → AuthenticatedContent 表示
6. ユーザーデータ取得・表示
```

### GitHub API統合

```
1. lib/github-api.ts でAPI呼び出し
2. lib/auth.ts で認証トークン管理
3. カスタムフック（use-user.ts）でデータ取得
4. コンポーネントでUI表示
```

## ビルドアーキテクチャ

### Plasmo（Chrome拡張機能）

```
src/popup/index.tsx
    ↓ Plasmo Build
build/chrome-mv3-dev/
    ├── popup.html
    ├── popup.js
    └── manifest.json (自動生成)
```

### Next.js（Webアプリ）

```
src/app/page.tsx
    ↓ Next.js Build
.next/
    ├── static/
    ├── server/
    └── ...
```

### 共有アセット

- **CSS**: `src/styles/globals.css`（両環境で共有）
- **コンポーネント**: `src/components/`（完全共有）
- **ユーティリティ**: `src/lib/`, `src/hooks/`（完全共有）

## セキュリティアーキテクチャ

### Chrome拡張機能権限

```json
{
    "permissions": ["tabs", "identity", "storage", "notifications"],
    "host_permissions": [
        "https://*/*",
        "https://github.com/*",
        "https://api.github.com/*"
    ]
}
```

### 認証・API

- **OAuth2.0**: GitHub認証
- **トークン管理**: Chrome Storage暗号化
- **HTTPS必須**: 全API通信
- **CSP**: Content Security Policy適用

## スケーラビリティ考慮

### コンポーネント拡張

- shadcn/uiによる統一されたデザインシステム
- モノレポ構造でのコンポーネント共有
- TypeScript厳格型付けによる保守性

### 状態管理拡張戦略

1. **フェーズ1**: React useState（現在）
2. **フェーズ2**: Zustand/Jotai導入
3. **フェーズ3**: React Query統合

### パフォーマンス最適化

- React.memo標準適用
- Code Splitting（Next.js）
- Tree Shaking（Plasmo）
- Chrome Storage効率的活用
