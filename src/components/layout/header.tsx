import { memo } from 'react'

import { GearIcon } from '@primer/octicons-react'

import { GitHubButton } from '@/components/github/button'

interface HeaderProps {
    onSettingsClick?: () => void
    onRepositorySearch?: (query: string) => void
    searchPlaceholder?: string
}

/**
 * Header component with repository search and settings button
 * Implements the top section of the 600x600px popup layout
 */
export const Header = memo(function Header({
    onSettingsClick,
    onRepositorySearch,
    searchPlaceholder = 'Search repositories...',
}: HeaderProps) {
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onRepositorySearch?.(event.target.value)
    }

    return (
        <header className="border-border bg-background border-b p-3">
            <div className="flex items-center justify-between gap-2">
                {/* Repository Search Input - Takes most of the space */}
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            onChange={handleSearchChange}
                            className="bg-muted border-border focus:ring-ring focus:border-primary w-full rounded-md border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                            aria-label="Search repositories"
                        />
                    </div>
                </div>

                {/* Settings Button */}
                <GitHubButton
                    variant="outline"
                    size="sm"
                    onClick={onSettingsClick}
                    className="shrink-0 px-2"
                    aria-label="Open settings"
                >
                    <GearIcon size={16} />
                </GitHubButton>
            </div>
        </header>
    )
})

export type { HeaderProps }
