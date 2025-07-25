# 要件定義書

## はじめに

GitHub Navigator Chrome拡張機能は、開発者がGitHubの各種機能に素早くアクセスし、重要な通知を見逃さないためのツールです。リポジトリ中心のUIを提供し、複数のGitHubリポジトリを効率的に管理することで、開発者の生産性向上とプロジェクト管理の効率化を実現します。

## 要件

### 要件 1

**ユーザーストーリー:** GitHubユーザーとして、リポジトリを素早く選択・切り替えたい。これにより、コンテキストスイッチなしで複数のプロジェクトを効率的に管理できる。

#### 受け入れ基準

1. 拡張機能のポップアップが開かれた時、システムはオートコンプリート検索機能付きのリポジトリ選択インターフェースを表示する
2. ユーザーがリポジトリ検索フィールドに入力した時、システムはGitHub API `/user/repos`エンドポイントを使用してアクセス可能なリポジトリのリアルタイムフィルタリングを提供する
3. リポジトリが選択されていない時、システムはリポジトリ選択画面をプライマリインターフェースとして表示する
4. ユーザーがリポジトリを選択した時、システムはそれを現在のアクティブリポジトリとして保存し、リポジトリ固有のコンテンツを表示する
5. ユーザーが最近使用したリポジトリにアクセスする時、システムは最大10個の最近アクセスしたリポジトリを表示する
6. ユーザーがリポジトリをお気に入りに登録した時、システムは選択インターフェースでお気に入りリポジトリへのクイックアクセスを提供する

### 要件 2

**ユーザーストーリー:** GitHubユーザーとして、GitHubと安全に認証したい。これにより、プライベートリポジトリと通知にアクセスできる。

#### 受け入れ基準

1. ユーザーが初めて拡張機能を使用する時、システムはGitHub OAuth 2.0認証フローを開始する
2. 認証が成功した時、システムはPersonal Access Tokenを暗号化して安全に保存する
3. トークンが保存された時、システムは最小限の必要なスコープを要求する：`notifications`、`public_repo`、およびオプションで`repo`
4. トークンが30日以内に期限切れになる時、システムはユーザーに認証の更新を通知する
5. システムがトークンの有効性をチェックする時、24時間ごとにトークンを検証する
6. トークンが無効になった時、システムは再認証を促す

### 要件 3

**ユーザーストーリー:** GitHubユーザーとして、リポジトリからの通知を受信・管理したい。これにより、重要な更新を見逃さない。

#### 受け入れ基準

1. 通知が利用可能な時、システムはGitHub APIを使用して選択されたリポジトリの通知を取得する
2. 新しい通知が到着した時、システムは拡張機能アイコンに未読数バッジを表示する
3. 未読通知がある時、システムは数字付きの赤いバッジを表示する（99件以上の場合は「99+」）
4. 通知がフィルタリングされる時、システムはタイプ（Issue、PR、リリース）およびリポジトリ/組織単位でのフィルタリングを許可する
5. デスクトップ通知が有効な時、システムは新しいアイテムのデスクトップ通知を表示する
6. ユーザーが通知を既読にマークした時、システムはGitHubのネイティブシステムとは独立した既読ステータスを維持する

### 要件 4

**ユーザーストーリー:** GitHubユーザーとして、頻繁にアクセスするGitHubページへのカスタムショートカットを作成したい。これにより、重要な場所に素早くナビゲートできる。

#### 受け入れ基準

1. ユーザーがショートカットを作成する時、システムはカスタムラベル付きの任意のGitHub URLの登録を許可する
2. ショートカットが表示される時、システムは4×5グリッドレイアウト（最大20ショートカット）で表示する
3. ショートカットが配置される時、システムは@dnd-kit/coreを使用したドラッグ&ドロップによる並び替えをサポートする
4. ショートカットが作成された時、@primer/octicons-reactアイコンを使用する
5. ショートカットがアクセスされる時、システムはターゲットURLへのワンクリックナビゲーションを提供する
6. ショートカットが管理される時、システムは既存のショートカットの編集と削除を許可する

### 要件 5

**ユーザーストーリー:** GitHubユーザーとして、一般的なGitHub機能への素早いアクセスが欲しい。これにより、複数のタブを開くことなく効率的にナビゲートできる。

#### 受け入れ基準

1. メインインターフェースが表示される時、システムはリポジトリダッシュボード、Issues一覧、Pull Requests一覧、通知ページへのワンクリックアクセスを提供する
2. 検索機能が使用される時、システムはGitHub Search APIを使用してIssues、Pull Requests、コードのリポジトリ全体検索を提供する
3. 検索が実行される時、システムは素早い再アクセスのために検索履歴を保存する
4. キーボードショートカットが使用される時、システムはCtrl+Shift+G（MacではCmd+Shift+G）で拡張機能を開くことに応答する
5. インターフェースがナビゲートされる時、システムはTab、矢印キー、数字キー（1-9）を使用したポップアップ内でのキーボードナビゲーションをサポートする

### 要件 6

**ユーザーストーリー:** GitHubユーザーとして、拡張機能が好みの言語とテーマで動作してほしい。これにより、開発環境とよく統合される。

#### 受け入れ基準

1. 拡張機能が読み込まれる時、システムは英語（プライマリ）と日本語（セカンダリ）の両方の言語をサポートする
2. 言語が選択される時、システムはChrome拡張機能i18n APIとreact-i18nextを組み合わせて翻訳に使用する
3. テーマ設定が設定される時、システムはnext-themesを使用してライト、ダーク、システム自動テーマモードをサポートする
4. ダークモードがアクティブな時、システムはGitHubの公式ダークテーマカラースキームに従う
5. アクセシビリティが考慮される時、システムはWCAG 2.1 AA標準に準拠する

### 要件 7

**ユーザーストーリー:** GitHubユーザーとして、オフライン時やAPI制限に達した時でも拡張機能が確実に動作してほしい。これにより、中断することなく作業を続けられる。

#### 受け入れ基準

1. ネットワークが利用できない時、システムはキャッシュされたデータを表示し、オフラインステータスを示す
2. APIレート制限に達した時、システムはキャッシュされたコンテンツを表示し、制限リセットまでのカウントダウンを表示する
3. データがキャッシュされる時、システムはリポジトリ一覧を24時間、通知を5分、Issues/PRsを15分キャッシュする
4. エラーが発生した時、システムは指数バックオフリトライ戦略を実装する（最大3回試行）
5. 重大なエラーが発生した時、システムは適切な重要度レベル（ERROR、WARN、INFO）でユーザーフレンドリーなエラーメッセージを表示する

### 要件 8

**ユーザーストーリー:** GitHubユーザーとして、拡張機能が良好なパフォーマンスで素早く読み込まれてほしい。これにより、ワークフローが遅くならない。

#### 受け入れ基準

1. ポップアップが開かれる時、システムは300ms以内に表示する
2. APIリクエストが行われる時、システムは2秒以内に完了する（キャッシュ使用時は100ms）
3. 拡張機能がビルドされる時、システムはバンドルサイズを1MB未満に維持する
4. バックグラウンドで実行される時、システムはService Workerで50MB未満のメモリを使用する
5. 通知がポーリングされる時、システムは通知を5分ごと、その他のデータを15分ごとにチェックする
