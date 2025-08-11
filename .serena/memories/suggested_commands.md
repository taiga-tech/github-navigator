# 推奨コマンド一覧

## 基本開発コマンド

### デュアル開発サーバー起動

```bash
# 最重要：拡張機能とNext.jsアプリを同時開発
pnpm dev
# 内部で以下を並行実行:
# - pnpm dev:plasmo (localhost:3000)
# - pnpm dev:next (localhost:1947)
```

### 個別開発サーバー

```bash
pnpm dev:plasmo    # Chrome拡張機能のみ
pnpm dev:next      # Next.jsアプリのみ
```

## ビルドコマンド

### 本番ビルド

```bash
pnpm build         # 拡張機能 + Next.jsアプリ
pnpm build:plasmo  # Chrome拡張機能のみ → build/chrome-mv3-prod
pnpm build:next    # Next.jsアプリのみ
```

### 本番サーバー起動

```bash
pnpm start         # Next.js本番サーバー
```

## コード品質チェック（タスク完了時必須）

### TypeScript型チェック

```bash
pnpm typecheck     # 必須：実装後は必ず実行
```

### ESLint（Flat Config）

```bash
pnpm lint          # チェックのみ
pnpm lint:fix      # 自動修正
```

### Prettier（自動整形）

```bash
pnpm format        # 全ファイル整形・インポート順序整理
```

## テストコマンド

### 基本テスト

```bash
pnpm test              # テスト実行
pnpm test:watch        # ウォッチモード
pnpm test:ui           # UI付きテスト実行
pnpm test:coverage     # カバレッジ計測（80%閾値）
```

## shadcn/ui コンポーネント管理

### コンポーネント追加

```bash
# 利用可能コンポーネント一覧確認
pnpm dlx shadcn@latest add

# 特定コンポーネント追加
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add dialog

# 複数同時追加
pnpm dlx shadcn@latest add button card badge

# 既存コンポーネント更新
pnpm dlx shadcn@latest add button --overwrite
```

## Chrome拡張機能開発

### 拡張機能テスト方法

1. `pnpm dev` でビルド
2. Chromeで `build/chrome-mv3-dev` ディレクトリを読み込み
3. ポップアップでテスト

### Next.jsアプリアクセス

- URL: `http://localhost:1947`
- 拡張機能と同じUIを共有

## Git・その他

### 基本Git操作

```bash
git status
git add .
git commit -m "message"
git push
```

### システムコマンド（Darwin）

```bash
ls          # ファイル一覧
find        # ファイル検索
grep        # テキスト検索（ripgrepも利用可能）
cd          # ディレクトリ移動
```

## 重要な開発ルール

### パフォーマンス必須項目

- コンポーネントはmemo()で囲む
- イベントハンドラーはuseCallback()使用
- 重い計算はuseMemo()使用

### CSS制約

- absolute/fixed/stickyポジショニング禁止
- Flexbox/Gridレイアウト優先
- Tailwind CSSユーティリティクラス活用

### ファイル作成原則

- 既存ファイル編集を優先
- 新規ファイルは最小限に
- ドキュメントファイル(.md)は明示的要求時のみ
