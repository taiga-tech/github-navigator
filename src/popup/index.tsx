import { GearIcon } from '@primer/octicons-react'

import { GitHubButton } from '@/components/github/button'
import { GitHubCard } from '@/components/github/card'
import { RepoCard } from '@/components/github/repo-card'
import { Providers } from '@/components/providers'

import '@/styles/globals.css'

const IndexPopup = () => {
    // サンプルリポジトリデータ
    const sampleRepos = [
        {
            name: 'github-navigator',
            visibility: 'Public' as const,
            description: 'A Chrome extension for efficient GitHub navigation',
            language: 'TypeScript',
            languageColor: '#3178c6',
            stars: '12',
        },
        {
            name: 'my-project',
            visibility: 'Private' as const,
            description: 'Personal project for learning React and TypeScript',
            language: 'JavaScript',
            languageColor: '#f1e05a',
            stars: '3',
        },
    ]

    return (
        <Providers>
            <div className="bg-background text-foreground h-150 w-150">
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
                                    {sampleRepos.map((repo, index) => (
                                        <RepoCard
                                            key={index}
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
            </div>
        </Providers>
    )
}

export default IndexPopup
