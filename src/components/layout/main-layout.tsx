import type { ReactNode } from 'react'

import { memo } from 'react'

interface MainLayoutProps {
    /** Content for the main area (left side, 2/3 width) */
    mainContent: ReactNode
    /** Content for the sidebar navigation (right side, 1/3 width) */
    sidebarContent: ReactNode
    className?: string
}

/**
 * Main layout component implementing the 2:1 ratio split layout
 * Left side: Main content area (2/3 width)
 * Right side: Tab navigation sidebar (1/3 width)
 */
export const MainLayout = memo(function MainLayout({
    mainContent,
    sidebarContent,
    className = '',
}: MainLayoutProps) {
    return (
        <div className={`flex flex-1 overflow-hidden ${className}`}>
            {/* Main Content Area (Left Side - 2/3 width) */}
            <main className="border-border bg-background flex-[2] overflow-y-auto border-r">
                {mainContent}
            </main>

            {/* Tab Navigation Sidebar (Right Side - 1/3 width) */}
            <aside className="bg-background flex-1 overflow-y-auto">
                {sidebarContent}
            </aside>
        </div>
    )
})

export type { MainLayoutProps }
