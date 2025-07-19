## 1. jitiパッケージのパッチ適用

### パッチ作成の開始

```bash
pnpm patch jiti
```

実行すると、パッケージの内容を含むフォルダ（例：`node_modules/.pnpm_patches/jiti@2.4.2`）が作成されます。

### ファイル編集

以下のファイルで**node:プレフィックスを削除**します：

- `dist/babel.cjs`
- `dist/jiti.cjs`
- `lib/jiti-cli.mjs`
- `lib/jiti-hooks.mjs`
- `lib/jiti-register.mjs`
- `lib/jiti.cjs`
- `lib/jiti.mjs`

**注意点：**

- `node:`プレフィックスのみを削除（`node:fs` → `fs`）
- 類似コードもあるため、すべて一括置換はせず手動で確認
- 置き換えが必要なインスタンスは少数のみ

### パッチの保存

```bash
pnpm patch-commit <表示されたパス>
```

## 2. @tailwindcss/oxideパッケージのパッチ適用

### パッチ作成の開始

```bash
pnpm patch @tailwindcss/oxide
```

### ファイル編集

`index.js`ファイルで：

- ファイル先頭の2つの`node:`import文のプレフィックスを削除

### パッチの保存

```bash
pnpm patch-commit <表示されたパス>
```

## 3. 結果確認

- `package.json`の`pnpm.patchedDependencies`に両方のパッケージが追加される
- 次回`pnpm install`時に自動的にパッチが適用される

## 全体の流れ

```bash
# 1. jitiパッチ
pnpm patch jiti
# → ファイル編集（複数ファイルのnode:削除）
pnpm patch-commit '/<project-dir>/node_modules/.pnpm_patches/jiti@2.4.2'

# 2. oxideパッチ
pnpm patch @tailwindcss/oxide
# → index.jsのnode:削除（先頭2箇所のみ）
pnpm patch-commit '/<project-dir>/node_modules/.pnpm_patches/@tailwindcss/oxide@4.1.11'

# 3. 確認
pnpm install
```

https://gist.github.com/vantezzen/f799643aebbfd5522ce87bababb85c5d
