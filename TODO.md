# TODO: PRレビュー修正事項

## 高優先度 (必須修正)

### 1. テストスイート実装

- [ ] Jestテストフレームワーク導入
- [ ] React Testing Libraryセットアップ
- [ ] package.jsonにテストスクリプト追加
    ```json
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
    ```
- [ ] 各UIコンポーネントのユニットテスト作成
- [ ] GitHub風コンポーネントのテスト実装

### 2. コード品質修正

- [ ] React.memo追加 (特にリストコンポーネント)
    - [ ] `src/components/github/button.tsx`
    - [ ] `src/components/github/theme-toggle.tsx`
    - [ ] その他頻繁に再レンダリングされるコンポーネント

### 3. パフォーマンス最適化

- [ ] `src/components/github/button.tsx:23-49` - Switch文をオブジェクトマップに変更
    ```tsx
    const VARIANT_CLASSES = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
            'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        // ...
    } as const
    ```

## 中優先度 (推奨修正)

### 4. TypeScript型定義強化

- [ ] `src/components/github/theme-toggle.tsx:16` - theme型をより具体的に定義
- [ ] propsの型定義をより厳密に
- [ ] 全コンポーネントのProps型export

### 5. アクセシビリティ改善

- [ ] Theme toggleにARIAラベル追加
- [ ] ボタンコンポーネントにaria-describedby追加
- [ ] キーボードナビゲーション対応確認

### 6. エラーハンドリング強化

- [ ] エラーバウンダリコンポーネント作成
- [ ] 各コンポーネントにエラーステート実装
- [ ] ローディング・エラー状態の統一

## 低優先度 (将来改善)

### 7. 開発環境改善

- [ ] Storybookコンポーネントドキュメント追加
- [ ] E2Eテスト (Playwright) 導入
- [ ] バンドルサイズ最適化 (コード分割)

### 8. パフォーマンス監視

- [ ] Core Web Vitals監視
- [ ] レンダリング最適化
- [ ] メモリリーク検出

## 修正手順

### Phase 1: 緊急修正

2. React.memo追加
3. Button component最適化

### Phase 2: テスト実装

1. Jest + React Testing Library セットアップ
2. 基本テストケース作成
3. カバレッジ80%以上達成

### Phase 3: 品質向上

1. TypeScript型定義強化
2. アクセシビリティ改善
3. エラーハンドリング追加

## 修正基準

- **コード品質**: ESLint + Prettier準拠
- **パフォーマンス**: React.memo、useMemo、useCallback活用
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **テストカバレッジ**: 80%以上
- **TypeScript**: strict mode対応

## 完了確認

各修正完了後は以下を実行：

```bash
pnpm exec tsc --noEmit  # 型チェック
pnpm lint               # コード品質チェック
pnpm test               # テスト実行
pnpm build              # ビルド確認
```

---

_最終更新: 2025-07-15_
_作成者: Claude Code_
