# タスク完了時のチェックリスト

## 必須実行コマンド（タスク完了後）

### 1. TypeScript型チェック

```bash
pnpm typecheck
```

- **目的**: TypeScriptエラーがないことを確認
- **失敗時**: 型エラーを修正してから次へ進む

### 2. ESLintチェック

```bash
pnpm lint
```

- **目的**: コードスタイル・品質チェック
- **自動修正**: `pnpm lint:fix` で修正可能な問題を解決

### 3. テスト実行

```bash
pnpm test
```

- **目的**: 既存機能の回帰テスト
- **カバレッジ**: 80%以上を維持

### 4. フォーマット確認

```bash
pnpm format
```

- **目的**: コード整形・インポート順序統一
- **自動**: Prettierが自動整形

## Chrome拡張機能特有のテスト

### 5. 拡張機能動作確認

```bash
pnpm dev
```

1. `build/chrome-mv3-dev` をChromeで読み込み
2. ポップアップ動作確認
3. Next.jsアプリ（`localhost:1947`）でも動作確認

### 6. 本番ビルド確認

```bash
pnpm build
```

- **目的**: 本番環境でのビルドエラーチェック
- **出力**: `build/chrome-mv3-prod` が正常生成されること

## コード品質チェック項目

### パフォーマンス最適化確認

- [ ] 新規コンポーネントに`memo()`適用済み
- [ ] イベントハンドラーに`useCallback()`使用済み
- [ ] 重い計算処理に`useMemo()`使用済み
- [ ] オブジェクト/配列生成の適切なメモ化

### CSS・レイアウト確認

- [ ] `absolute`、`fixed`、`sticky`ポジショニング未使用
- [ ] Flexbox/Gridレイアウト使用
- [ ] Tailwind CSSユーティリティクラス活用
- [ ] GitHub Primerカラーパレット準拠

### TypeScript品質確認

- [ ] `any`型の使用を最小限に抑制
- [ ] 適切な型注釈付け
- [ ] 未使用変数・インポートの削除
- [ ] パスマッピング（`@/`）の適切な使用

## 新機能追加時の追加確認

### shadcn/uiコンポーネント使用時

- [ ] 既存の46コンポーネントから適切選択
- [ ] 新規追加時は`pnpm dlx shadcn@latest add`使用
- [ ] Radix UIベースコンポーネントの適切な活用

### Chrome拡張機能権限

- [ ] 新API使用時は`manifest.permissions`更新確認
- [ ] `@plasmohq/storage`の適切な使用
- [ ] デュアル環境（拡張機能＋Next.js）での動作確認

## Git コミット前確認

### コードの最終チェック

- [ ] 全必須コマンド実行済み（typecheck, lint, test, format）
- [ ] 拡張機能・Next.jsアプリ両方で動作確認済み
- [ ] コミットメッセージが適切
- [ ] 不要なファイル・ログ出力の削除

### 品質基準

- [ ] ESLintエラー: 0件
- [ ] TypeScriptエラー: 0件
- [ ] テストカバレッジ: 80%以上維持
- [ ] 新機能の基本的な動作テスト完了

## トラブルシューティング

### よくあるエラーと対処

1. **TypeScript型エラー**: `@types/*`パッケージの不足確認
2. **ESLint Flat Config**: 設定ファイル（`eslint.config.js`）の確認
3. **Plasmoビルドエラー**: `pnpm-lock.yaml`の再生成
4. **shadcn/ui導入エラー**: `components.json`設定確認

### デバッグ用コマンド

```bash
# 依存関係確認
pnpm why [package-name]

# キャッシュクリア
pnpm store prune

# 型定義再生成
rm -rf .plasmo && pnpm dev
```
