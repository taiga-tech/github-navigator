import { FileExplorer, IssueItem, RepoCard } from '@/components/github'

export function GitHubShowcase() {
    const repositories = [
        {
            name: 'shadcn/ui',
            visibility: 'Public' as const,
            description:
                'Beautifully designed components built with Radix UI and Tailwind CSS.',
            language: 'TypeScript',
            languageColor: '#3178c6',
            stars: '45.2k',
        },
        {
            name: 'github/gitignore',
            visibility: 'Public' as const,
            description: 'A collection of useful .gitignore templates',
            language: 'Shell',
            languageColor: '#89e051',
            stars: '144k',
        },
        {
            name: 'microsoft/vscode',
            visibility: 'Public' as const,
            description: 'Visual Studio Code',
            language: 'TypeScript',
            languageColor: '#3178c6',
            stars: '150k',
        },
    ]

    const issues = [
        {
            title: 'Add support for custom themes',
            number: 123,
            author: 'user1',
            status: 'open' as const,
            labels: [{ name: 'enhancement', type: 'enhancement' as const }],
        },
        {
            title: 'Bug: Dark mode not working properly',
            number: 122,
            author: 'user2',
            status: 'closed' as const,
            labels: [{ name: 'bug', type: 'bug' as const }],
        },
        {
            title: 'Feature request: GitHub theme integration',
            number: 121,
            author: 'user3',
            status: 'open' as const,
            labels: [{ name: 'feature request', type: 'feature' as const }],
        },
    ]

    return (
        <section className="space-y-8">
            <h2 className="text-foreground text-xl font-semibold">
                GitHub UIエレメント
            </h2>

            {/* リポジトリカード */}
            <div className="space-y-4">
                <h3 className="text-foreground text-lg font-medium">
                    リポジトリカード
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {repositories.map((repo) => (
                        <RepoCard key={repo.name} {...repo} />
                    ))}
                </div>
            </div>

            {/* イシューリスト */}
            <div className="space-y-4">
                <h3 className="text-foreground text-lg font-medium">
                    イシューリスト
                </h3>
                <div className="border-border bg-card overflow-hidden rounded-lg border">
                    {issues.map((issue) => (
                        <IssueItem key={issue.number} {...issue} />
                    ))}
                </div>
            </div>

            {/* ファイルエクスプローラー */}
            <div className="space-y-4">
                <h3 className="text-foreground text-lg font-medium">
                    ファイルエクスプローラー
                </h3>
                <FileExplorer />
            </div>
        </section>
    )
}
