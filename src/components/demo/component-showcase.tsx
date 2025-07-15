import { GitHubAlert, GitHubButton, GitHubCard } from '@/components/github'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function ComponentShowcase() {
    return (
        <section className="space-y-8">
            <h2 className="text-foreground text-xl font-semibold">
                コンポーネントショーケース
            </h2>

            {/* ボタン */}
            <div className="space-y-4">
                <h3 className="text-foreground text-lg font-medium">ボタン</h3>
                <div className="flex flex-wrap gap-4">
                    <GitHubButton variant="primary">
                        プライマリボタン
                    </GitHubButton>
                    <GitHubButton variant="secondary">
                        セカンダリボタン
                    </GitHubButton>
                    <GitHubButton variant="outline">
                        アウトラインボタン
                    </GitHubButton>
                    <GitHubButton variant="danger">危険ボタン</GitHubButton>
                </div>
            </div>

            {/* カード */}
            <div className="space-y-4">
                <h3 className="text-foreground text-lg font-medium">カード</h3>
                <GitHubCard
                    title="カードタイトル"
                    status={{ label: 'アクティブ', variant: 'success' }}
                >
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            これはカードの内容です。GitHubダークテーマのスタイルが適用されています。
                        </p>
                        <div className="flex gap-2">
                            <GitHubButton size="sm">編集</GitHubButton>
                            <GitHubButton size="sm" variant="outline">
                                詳細
                            </GitHubButton>
                        </div>
                    </div>
                </GitHubCard>
            </div>

            {/* フォーム要素 */}
            <div className="space-y-4">
                <h3 className="text-foreground text-lg font-medium">
                    フォーム要素
                </h3>
                <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">ユーザー名</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="ユーザー名を入力してください"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">メールアドレス</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">メッセージ</Label>
                        <Textarea
                            id="message"
                            placeholder="メッセージを入力してください"
                            rows={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">カテゴリ</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="カテゴリを選択" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">
                                    バグレポート
                                </SelectItem>
                                <SelectItem value="feature">
                                    機能リクエスト
                                </SelectItem>
                                <SelectItem value="question">質問</SelectItem>
                                <SelectItem value="other">その他</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* アラート */}
            <div className="space-y-4">
                <h3 className="text-foreground text-lg font-medium">
                    アラート
                </h3>
                <div className="space-y-4">
                    <GitHubAlert variant="success">
                        変更が正常に保存されました。
                    </GitHubAlert>
                    <GitHubAlert variant="warning">
                        この操作は元に戻せません。続行しますか？
                    </GitHubAlert>
                    <GitHubAlert variant="danger">
                        エラーが発生しました。もう一度お試しください。
                    </GitHubAlert>
                    <GitHubAlert variant="info">
                        新しいバージョンが利用可能です。
                    </GitHubAlert>
                </div>
            </div>

            {/* コードブロック */}
            <div className="space-y-4">
                <h3 className="text-foreground text-lg font-medium">
                    コードブロック
                </h3>
                <pre className="border-border bg-card overflow-x-auto rounded-lg border p-4 text-sm">
                    <code className="text-card-foreground">{`import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Example() {
  return (
    <Card className="github-dark">
      <CardHeader>
        <CardTitle>GitHub Dark Theme</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  )
}`}</code>
                </pre>
            </div>
        </section>
    )
}
