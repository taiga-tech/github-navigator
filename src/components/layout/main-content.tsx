import { memo } from 'react'

import { GitHubCard } from '@/components/github/card'
import { RepoCard } from '@/components/github/repo-card'

// Sample data for demonstration
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

interface MainContentProps {
    className?: string
}

/**
 * Main content area component
 * Displays the primary content in the left side of the layout
 */
export const MainContent = memo(function MainContent({
    className = '',
}: MainContentProps) {
    return (
        <div className={`p-4 ${className}`}>
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
        </div>
    )
})

export type { MainContentProps }
