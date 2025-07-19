# プロジェクト構造

## ルートディレクトリ構成

```
├── src/                    # ソースコード
├── assets/                 # 静的アセット（アイコン、画像）
├── build/                  # ビルド出力（生成）
├── .plasmo/               # Plasmoフレームワークファイル（生成）
├── .next/                 # Next.jsビルドキャッシュ（生成）
├── patches/               # パッケージパッチ
├── .docs/                 # ドキュメントとデモ
└── .kiro/                 # Kiro AIアシスタント設定
```

## ソースコード構造（`src/`）

### コアディレクトリ

- **`src/app/`**: Next.jsアプリルーターページ（デモ/ランディング用）
- **`src/popup/`**: Chrome拡張機能ポップアップエントリーポイント
- **`src/components/`**: 目的別に整理されたReactコンポーネント
- **`src/hooks/`**: カスタムReactフック
- **`src/lib/`**: ユーティリティ関数と共有ロジック
- **`src/styles/`**: グローバルCSSとTailwind設定

### コンポーネント構成

#### `src/components/ui/`

- shadcn/uiコンポーネント（46コンポーネント導入済み）
- Radix UIベースのベースUIプリミティブ
- GitHubテーマとの一貫したスタイリング
- 例: `button.tsx`, `dialog.tsx`, `card.tsx`

#### `src/components/github/`

- GitHub固有のUIコンポーネント
- GitHubのデザイン言語に合わせたカスタムコンポーネント
- 例: `repo-card.tsx`, `issue-item.tsx`, `theme-toggle.tsx`

#### `src/components/demo/`

- デモとショーケースコンポーネント
- ドキュメント用のNext.jsアプリで使用
- 例: `component-showcase.tsx`, `github-showcase.tsx`

## 設定ファイル

### ビルド & 開発

- **`package.json`**: 依存関係とスクリプト
- **`tsconfig.json`**: パスエイリアス付きTypeScript設定
- **`next.config.mjs`**: Next.js設定
- **`postcss.config.js`**: Tailwind用PostCSS設定

### コード品質

- **`eslint.config.js`**: TypeScriptルール付きESLint設定
- **`.prettierrc.mjs`**: Prettierフォーマットルール
- **`.prettierignore`**: フォーマットから除外するファイル

### UIフレームワーク

- **`components.json`**: shadcn/ui設定
- **`src/styles/globals.css`**: GitHubテーマ変数付きグローバルスタイル

## 主要な規則

### ファイル命名

- Reactコンポーネント: PascalCase（例: `RepoCard.tsx`）
- フック: `use`プレフィックス付きcamelCase（例: `useRepository.ts`）
- ユーティリティ: camelCase（例: `utils.ts`）
- ページ: ハイフン付き小文字（Next.js規則）

### インポートエイリアス

- `@/*` は `src/*` にマップ
- `@/components` コンポーネントインポート用
- `@/lib/utils` ユーティリティ関数用
- `@/hooks` カスタムフック用

### コンポーネント構造

- ファイルごとに1つのコンポーネント
- メインコンポーネントはデフォルトエクスポート
- 関連する型/インターフェースは名前付きエクスポート
- コンポーネント固有の型は同じ場所に配置

### スタイリングアプローチ

- Tailwind CSSユーティリティクラス
- テーマ変数用のCSSカスタムプロパティ
- GitHubインスパイアカラーパレット
- モバイルファーストアプローチのレスポンシブデザイン
- CSS変数によるダーク/ライトテーマサポート

## 拡張機能固有の構造

### Plasmoフレームワークファイル

- **`.plasmo/`**: 生成されたフレームワークファイル
- **`src/popup/index.tsx`**: メインポップアップエントリーポイント
- バックグラウンドスクリプトとコンテンツスクリプトはPlasmo規則に従う

### ビルド出力

- **`build/chrome-mv3-dev/`**: 開発ビルド
- **`build/chrome-mv3-prod/`**: 本番ビルド
- マニフェストとアセットはPlasmoによって自動生成
