import { memo } from 'react'

import { GearIcon } from '@primer/octicons-react'

import { AuthComponent, AuthGuard } from '@/components/github/auth'
import { GitHubButton } from '@/components/github/button'
import { GitHubCard } from '@/components/github/card'
import { RepoCard } from '@/components/github/repo-card'
import { Providers } from '@/components/providers'

import '@/styles/globals.css'

// サンプルリポジトリデータ（コンポーネント外で定義）
const SAMPLE_REPOS = [
    {
        id: 'github-navigator',
        name: 'github-navigator',
        visibility: 'Public' as const,
        description: 'A Chrome extension for efficient GitHub navigation',
        language: 'TypeScript',
        languageColor: '#3178c6',
        stars: '12',
    },
    {
        id: 'my-project',
        name: 'my-project',
        visibility: 'Private' as const,
        description: 'Personal project for learning React and TypeScript',
        language: 'JavaScript',
        languageColor: '#f1e05a',
        stars: '3',
    },
] as const

// Main authenticated content component
const AuthenticatedContent = memo(function AuthenticatedContent() {
    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="border-border border-b p-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                className="bg-muted border-border focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-3 focus:outline-none"
                            />
                        </div>
                    </div>
                    <GitHubButton
                        variant="outline"
                        size="sm"
                        className="ml-2 px-2"
                    >
                        <GearIcon size={16} />
                    </GitHubButton>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area (Left Side - 2/3 width) */}
                <main className="border-border flex-[2] overflow-y-auto border-r p-4">
                    <GitHubCard
                        title="Recent Repositories"
                        status={{
                            label: 'Active',
                            variant: 'success',
                        }}
                    >
                        <div className="space-y-3">
                            {SAMPLE_REPOS.map((repo) => (
                                <RepoCard
                                    key={repo.id}
                                    name={repo.name}
                                    visibility={repo.visibility}
                                    description={repo.description}
                                    language={repo.language}
                                    languageColor={repo.languageColor}
                                    stars={repo.stars}
                                />
                            ))}
                        </div>
                    </GitHubCard>
                </main>

                {/* Tab Navigation (Right Side - 1/3 width) */}
                <aside className="flex-1 p-4">
                    <nav className="space-y-2">
                        <GitHubButton
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                        >
                            Issues
                        </GitHubButton>
                        <GitHubButton
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                        >
                            Pull Requests
                        </GitHubButton>
                        <GitHubButton
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                        >
                            Actions
                        </GitHubButton>
                        <GitHubButton
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                        >
                            Custom Links
                        </GitHubButton>
                    </nav>
                </aside>
            </div>
        </div>
    )
})

const IndexPopup = memo(function IndexPopup() {
    return (
        <Providers>
            <div className="bg-background text-foreground h-150 w-150">
                <AuthGuard
                    fallback={
                        <div className="p-4">
                            <AuthComponent />
                        </div>
                    }
                >
                    <AuthenticatedContent />
                </AuthGuard>
            </div>
        </Providers>
    )
})

export default IndexPopup
