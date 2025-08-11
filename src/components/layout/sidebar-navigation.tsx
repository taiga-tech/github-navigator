import { memo } from 'react'

import { GitHubButton } from '@/components/github/button'

interface SidebarNavigationProps {
    activeTab?: string
    onTabChange?: (tab: string) => void
    className?: string
}

/**
 * Sidebar navigation component
 * Displays navigation tabs in the right side of the layout
 */
export const SidebarNavigation = memo(function SidebarNavigation({
    activeTab,
    onTabChange,
    className = '',
}: SidebarNavigationProps) {
    const tabs = [
        { id: 'issues', label: 'Issues', count: 5 },
        { id: 'pull-requests', label: 'Pull Requests', count: 2 },
        { id: 'actions', label: 'Actions' },
        { id: 'custom-links', label: 'Custom Links' },
    ]

    const handleTabClick = (tabId: string) => {
        onTabChange?.(tabId)
    }

    return (
        <div className={`p-4 ${className}`}>
            <nav
                className="space-y-2"
                role="navigation"
                aria-label="Main navigation"
            >
                {tabs.map((tab) => (
                    <GitHubButton
                        key={tab.id}
                        variant={activeTab === tab.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleTabClick(tab.id)}
                        className="w-full justify-start"
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        <span className="flex w-full items-center justify-between">
                            <span>{tab.label}</span>
                            {tab.count && (
                                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                                    {tab.count}
                                </span>
                            )}
                        </span>
                    </GitHubButton>
                ))}
            </nav>
        </div>
    )
})

export type { SidebarNavigationProps }
