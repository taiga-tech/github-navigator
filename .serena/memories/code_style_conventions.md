# コードスタイル・規約

## TypeScript規約

### 基本規約

- **厳格型付け**: TypeScript 5.8.3使用
- **isolatedModules**: true（Plasmo要件）
- **未使用変数**: エラーレベル（アンダースコア接頭辞で無視可能）
- **any型**: 警告レベル（可能な限り避ける）

### インポート順序（Prettier自動整理）

```typescript
// 1. React/Next.js系
import { memo } from 'react'

import { NextPage } from 'next'

// 2. サードパーティライブラリ
import { Button } from '@radix-ui/react-button'

// 3. Plasmo固有
import { Storage } from '@plasmohq/storage'

// 4. 内部モジュール（@/パス）
import { MainLayout } from '@/components/layout'
import { useAuth } from '@/hooks/use-auth'

// 5. 相対パス
import './styles.css'
```

## React コンポーネント規約

### コンポーネント構造

```tsx
'use client' // Next.js App Router使用時

import { memo, useCallback, useMemo } from 'react'

// 外部でサンプルデータ等定義（推奨）
const SAMPLE_DATA = [...] as const

// メインコンポーネント
export const ComponentName = memo(function ComponentName({ prop1, prop2 }) {
    // カスタムフック
    const { data, loading } = useCustomHook()

    // メモ化されたコールバック
    const handleClick = useCallback(() => {
        // 処理
    }, [dependencies])

    // メモ化された計算値
    const computedValue = useMemo(() => {
        return expensiveCalculation(data)
    }, [data])

    return (
        <div className="flex items-center gap-4">
            {/* JSX */}
        </div>
    )
})
```

### 必須パフォーマンス最適化

1. **React.memo**: 全コンポーネントで必須
2. **useCallback**: イベントハンドラーで必須
3. **useMemo**: 重い計算・オブジェクト生成で必須
4. **単一責任**: 1コンポーネント = 1責任
5. **100行制限**: 超える場合は分割検討

## CSS・スタイリング規約

### Tailwind CSS使用原則

```tsx
// 推奨：ユーティリティクラス使用
<div className="flex items-center justify-between gap-4 p-4 rounded-md bg-card">

// 避ける：absolute/fixed positioning
<div className="absolute top-4 right-4"> {/* 禁止 */}

// 推奨：Flexbox/Grid使用
<div className="flex flex-col space-y-4">
<div className="grid grid-cols-2 gap-4">
```

### GitHub Primerデザインシステム

```tsx
// カラー変数使用
className =
    'bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]'

// rem基準サイズ
className = 'text-sm' /* 0.875rem / 14px */
className = 'text-base' /* 1rem / 16px */

// 8px基準スペーシング
className = 'gap-2' /* 0.5rem / 8px */
className = 'gap-4' /* 1rem / 16px */
```

## ファイル・命名規約

### ファイル命名

- **コンポーネント**: kebab-case（例：`main-layout.tsx`）
- **フック**: kebab-case（例：`use-mobile.ts`）
- **ユーティリティ**: kebab-case（例：`utils.ts`）
- **テスト**: `*.test.ts`

### パス解決

```typescript
// TypeScript（tsconfig.json）
"@/*": ["./src/*"]

// shadcn/ui（components.json）
"@/components/ui/*": コンポーネント
"@/lib/utils": ユーティリティ関数
"@/hooks/*": カスタムフック
```

## ESLint設定（Flat Config）

### 主要ルール

```javascript
// TypeScript
'@typescript-eslint/no-unused-vars': 'error'
'@typescript-eslint/no-explicit-any': 'warn'

// React
'react/react-in-jsx-scope': 'off'  // 新JSX変換対応
'react/prop-types': 'off'          // TypeScript使用のため

// React Hooks
'react-hooks/exhaustive-deps': 'error'  // 依存配列厳格チェック
```

## Chrome拡張機能特有規約

### Plasmoファイル構造

```
project-root/
├── popup.tsx        # ポップアップUI（自動認識）
├── options.tsx      # オプションページ（自動認識）
├── content.ts       # コンテンツスクリプト（自動認識）
└── src/
    ├── popup/index.tsx  # 実際のポップアップエントリーポイント
    └── components/      # 共有コンポーネント
```

### Storage API使用

```typescript
import { Storage } from '@plasmohq/storage'

const storage = new Storage()

// 非同期操作
await storage.set('key', value)
const value = await storage.get('key')
```

## テスト規約

### Vitest設定

- **環境**: jsdom
- **セットアップ**: `src/lib/__tests__/setup.ts`
- **カバレッジ閾値**: 80%（branches, functions, lines, statements）

### テストファイル構造

```typescript
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('ComponentName', () => {
    it('should render correctly', () => {
        // テスト実装
    })
})
```
