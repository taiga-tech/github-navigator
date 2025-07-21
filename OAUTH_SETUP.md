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

### 実際のCallback URL例

```
https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/
```

## 4. 環境変数設定

`.env`ファイルに以下を設定：

```env
PLASMO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
PLASMO_PUBLIC_GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

## 5. 複数環境対応

開発環境と本番環境で異なるOAuth Appを作成することを推奨：

### 開発用OAuth App

- Application name: `GitHub Navigator Extension (Dev)`
- Callback URL: 開発時のExtension ID

### 本番用OAuth App

- Application name: `GitHub Navigator Extension`
- Callback URL: 公開後のExtension ID

## 6. セキュリティ注意事項

- Client Secretは安全に管理する
- 本番環境では適切なスコープのみを要求する
- 定期的にアクセストークンを更新する

## 7. トラブルシューティング

### よくある問題

1. **Callback URL mismatch**: Extension IDが変わった場合は、GitHub OAuth Appの設定を更新
2. **Client ID/Secret不正**: 環境変数が正しく設定されているか確認
3. **Permissions不足**: manifest.jsonに`identity`権限が含まれているか確認
