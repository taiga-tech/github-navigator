# 技術スタック詳細

## 開発環境・ツール

### パッケージマネージャー

- **pnpm**: v10.13.1+sha512... (必須、npm/yarnは使用不可)

### TypeScript設定

- **base**: plasmo/templates/tsconfig.base を拡張
- **isolatedModules**: true
- **Next.jsプラグイン**: 有効
- **パスマッピング**: `@/*` → `./src/*`

### ESLint設定（Flat Config）

- **基本**: @eslint/js推奨設定
- **TypeScript**: typescript-eslint推奨設定
- **React**: react/react-in-jsx-scope無効化（新JSX変換対応）
- **React Hooks**: exhaustive-deps エラーレベル
- **Next.js**: core-web-vitals対応
- **Chrome拡張API**: chrome, window, documentなどグローバル設定済み

### テストフレームワーク（Vitest）

- **環境**: jsdom
- **カバレッジ**: v8プロバイダー、80%閾値
- **セットアップ**: `src/lib/__tests__/setup.ts`

## UI/UXライブラリ

### shadcn/ui設定

- **スタイル**: new-york
- **RSC**: 有効（React Server Components）
- **ベースカラー**: neutral
- **CSS変数**: 有効
- **導入済みコンポーネント**: 46個

### アイコンライブラリ

- **Lucide React**: v0.525.0 (shadcn/ui標準)
- **Octicons React**: v19.15.3 (GitHub公式アイコン)

### デザインシステム

```css
/* GitHub Primer カラーパレット */
--color-primary: 212 72% 59% (ライト: #0969da, ダーク: #58a6ff)
    --color-background: 0 0% 100% (ライト: #ffffff, ダーク: #0d1117)
    /* rem基準サイズシステム */ --font-size-xs: 0.6875rem /* 11px */
    --font-size-sm: 0.75rem /* 12px */ --font-size-base: 0.875rem /* 14px */
    --font-size-lg: 1rem /* 16px */;
```

## Chrome拡張機能設定

### マニフェスト権限

```json
{
    "host_permissions": [
        "https://*/*",
        "https://github.com/*",
        "https://api.github.com/*"
    ],
    "permissions": ["tabs", "identity", "storage", "notifications"]
}
```

### Plasmo特有機能

- **ファイル名ベースルーティング**: popup.tsx, options.tsx等を自動認識
- **自動マニフェスト生成**: package.jsonから生成
- **ホットリロード**: 開発中の自動リロード
- **デュアル開発サーバー**: 拡張機能 + Next.jsアプリ並行開発

## 状態管理

### 現在の構成

- **ローカル**: React useState + react-hook-form
- **グローバル**: next-themes (テーマ管理)
- **永続化**: @plasmohq/storage (Chrome拡張用)

### 将来の拡張戦略

1. フェーズ1（現在）: useState + Context API
2. フェーズ2: Zustand/Jotai導入
3. フェーズ3: React Query/SWR導入

## パフォーマンス最適化

### 必須パターン

```tsx
// コンポーネントメモ化
export const Component = memo(({ prop }) => {
    /* ... */
})

// コールバックメモ化
const handler = useCallback(() => {
    /* ... */
}, [deps])

// 計算値メモ化
const value = useMemo(() => expensiveCalc(data), [data])
```
