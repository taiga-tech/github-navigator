# GitHub OAuth Setup for Chrome Extension

## 1. GitHub OAuth App作成

1. GitHubにログインして、以下のURLにアクセス：
   https://github.com/settings/applications/new

2. 以下の情報を入力：
    - **Application name**: `GitHub Navigator Extension`
    - **Homepage URL**: `https://github.com/your-username/github-navigator`
    - **Application description**: `Chrome extension for efficient GitHub navigation`
    - **Authorization callback URL**: 以下のいずれかを使用

## 2. Callback URL設定

Chrome拡張機能では、以下のパターンのCallback URLを使用します：

### 開発環境用

```
https://<extension-id>.chromiumapp.org/
```

### 本番環境用（Chrome Web Store公開後）

```
https://<published-extension-id>.chromiumapp.org/
```

## 3. Extension IDの確認方法

### 開発時のExtension ID確認

1. Chrome拡張機能管理画面を開く: `chrome://extensions/`
2. 「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」で拡張機能を読み込む
4. 表示されるExtension IDをコピー

### 本番環境のExtension ID確認

Chrome Web Storeに公開した後、以下の方法でExtension IDを確認できます：

1. **Chrome Web Store URL**から取得:

    ```
    https://chrome.google.com/webstore/detail/{extension-id}
    ```

2. **拡張機能管理画面**で確認:
    - `chrome://extensions/`を開く
    - 公開済み拡張機能のIDをコピー

### 実際のCallback URL例

```
https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/
```

## 4. 環境変数設定

### 開発環境

`.env`ファイルに以下を設定：

```env
# 開発用GitHub OAuth設定
PLASMO_PUBLIC_GITHUB_CLIENT_ID=your_dev_github_client_id_here
PLASMO_PUBLIC_GITHUB_CLIENT_SECRET=your_dev_github_client_secret_here
```

### 本番環境

本番環境では、以下の方法で環境変数を設定：

#### Chrome Web Store公開版

Plasmoのビルド時に本番用の環境変数を使用：

```env
# 本番用GitHub OAuth設定
PLASMO_PUBLIC_GITHUB_CLIENT_ID=your_prod_github_client_id_here
PLASMO_PUBLIC_GITHUB_CLIENT_SECRET=your_prod_github_client_secret_here
```

#### ビルドコマンド例

```bash
# 本番ビルド前に環境変数を設定
export PLASMO_PUBLIC_GITHUB_CLIENT_ID="your_prod_client_id"
export PLASMO_PUBLIC_GITHUB_CLIENT_SECRET="your_prod_client_secret"

# 本番ビルド実行
pnpm build
```

## 5. 複数環境対応

開発環境と本番環境で異なるOAuth Appを作成することを強く推奨：

### 開発用OAuth App設定

- **Application name**: `GitHub Navigator Extension (Dev)`
- **Homepage URL**: `https://github.com/your-username/github-navigator`
- **Callback URL**: 開発時のExtension ID
- **Scopes**: `notifications`, `public_repo`, `repo`, `user:email`

### 本番用OAuth App設定

- **Application name**: `GitHub Navigator Extension`
- **Homepage URL**: `https://chrome.google.com/webstore/detail/{extension-id}`
- **Callback URL**: 本番Extension ID
- **Scopes**: `notifications`, `public_repo`, `repo`, `user:email`

### ステージング環境（オプション）

大規模なプロジェクトの場合、ステージング環境も検討：

- **Application name**: `GitHub Navigator Extension (Staging)`
- **Callback URL**: ステージング用Extension ID

## 6. セキュリティ注意事項

### 開発時のセキュリティ

- **`.env`ファイルを`.gitignore`に追加**
- **Client Secretは絶対にコミットしない**
- **開発チーム内でのSecretの安全な共有方法を確立**

### 本番環境のセキュリティ

- **最小権限の原則**: 必要最小限のスコープのみを要求
- **定期的なトークン検証**: 24時間ごとの自動検証を実装済み
- **レート制限の監視**: GitHub APIの使用状況を監視
- **アクセスログの記録**: 認証失敗の監視

### GitHub App vs OAuth App

大規模な運用の場合、GitHub Appへの移行を検討：

- **より厳密な権限管理**
- **インストールベースのアクセス制御**
- **Webhookサポート**
- **より高いレート制限**

## 7. 詳細なトラブルシューティング

### 認証エラー

#### エラー: "MISSING_CLIENT_ID"

**原因**: GitHub Client IDが設定されていない

**解決方法**:

1. `.env`ファイルが存在するか確認
2. `PLASMO_PUBLIC_GITHUB_CLIENT_ID`が正しく設定されているか確認
3. Client IDが20文字の英数字であることを確認

```bash
# 設定確認コマンド
echo $PLASMO_PUBLIC_GITHUB_CLIENT_ID
```

#### エラー: "Callback URL mismatch"

**原因**: GitHubで設定したCallback URLと実際のExtension IDが異なる

**解決方法**:

1. 現在のExtension IDを確認: `chrome://extensions/`
2. GitHub OAuth Appの設定を更新
3. 新しいCallback URLを設定: `https://{current-extension-id}.chromiumapp.org/`

#### エラー: "Rate limit exceeded"

**原因**: GitHub APIのレート制限に達した

**解決方法**:

1. レート制限がリセットされるまで待機（最大1時間）
2. アプリケーションの使用頻度を下げる
3. 認証済みリクエストの場合、5000回/時間まで利用可能

### ネットワーク関連

#### エラー: "Network error"

**原因**: インターネット接続またはGitHubサーバーの問題

**解決方法**:

1. インターネット接続を確認
2. GitHubのステータスページを確認: https://www.githubstatus.com/
3. 自動リトライ機能が働くまで待機（指数バックオフ実装済み）

#### エラー: "CORS error"

**原因**: Chrome拡張機能の権限設定の問題

**解決方法**:

1. `manifest.json`の`host_permissions`を確認:
    ```json
    {
        "host_permissions": ["https://github.com/*", "https://api.github.com/*"]
    }
    ```

### 開発環境固有の問題

#### Extension IDが変更される

**原因**: 拡張機能を再読み込みするとIDが変わる場合がある

**解決方法**:

1. 開発時は`key`フィールドをmanifest.jsonに追加してIDを固定
2. または、IDが変わった際にGitHub OAuth Appの設定を更新

#### 環境変数が反映されない

**原因**: Plasmoが環境変数を正しく読み込めていない

**解決方法**:

1. 開発サーバーを再起動: `pnpm dev`
2. `.env`ファイルの場所を確認（プロジェクトルートに配置）
3. 環境変数名にtypoがないか確認

### 本番環境固有の問題

#### Chrome Web Store公開後のID変更

**原因**: 開発時のIDと公開後のIDが異なる

**解決方法**:

1. 公開後のExtension IDを確認
2. 本番用GitHub OAuth Appの作成
3. 本番ビルド時に正しい環境変数を使用

#### ユーザーの認証が失敗する

**原因**: 複数の可能性

**調査方法**:

1. Chromeのデベロッパーツールでエラーログを確認
2. GitHubのOAuth Appの設定を確認
3. 拡張機能の権限が正しく設定されているか確認

## 8. 監視とメンテナンス

### 認証状況の監視

実装済みの監視機能：

- **トークン有効性の自動チェック**: 24時間ごと
- **レート制限の監視**: APIリクエストごと
- **エラーログの記録**: 詳細なエラー分類とログ

### メンテナンス作業

#### 定期的な確認事項（月1回）

1. **GitHub OAuth Appの設定確認**
2. **使用していないTokenの無効化**
3. **レート制限の使用状況確認**
4. **セキュリティ更新の確認**

#### 緊急時の対応

**GitHub OAuth Appが侵害された場合**:

1. 即座にClient Secretを再生成
2. 既存のアクセストークンを無効化
3. ユーザーに再認証を促す
4. セキュリティインシデントの記録

## 9. 高度な設定

### カスタムスコープの設定

デフォルト以外のスコープが必要な場合：

```typescript
// src/lib/auth.ts の GITHUB_SCOPES を修正
const GITHUB_SCOPES = [
    'notifications',
    'public_repo',
    'repo',
    'user:email',
    'read:org', // 組織情報の読み取り（追加例）
    'write:packages', // パッケージへの書き込み（追加例）
]
```

### エンタープライズ環境での使用

GitHub Enterprise Serverを使用する場合：

```typescript
// src/lib/github-api.ts の API URLを変更
const GITHUB_API_BASE = 'https://your-enterprise-github.com/api/v3'
```

### 複数のGitHubアカウント対応

将来的な機能として、複数アカウントの切り替えに対応する場合の設計考慮事項：

- **アカウントごとの認証状態管理**
- **UIでのアカウント選択機能**
- **ストレージのスコープ分離**

## 10. 参考リンク

- [GitHub OAuth App Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Chrome Extension Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Plasmo Framework Documentation](https://docs.plasmo.com/)
- [GitHub API Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
