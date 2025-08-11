'use client'

import { memo, useState } from 'react'

import { GearIcon, MarkGithubIcon } from '@primer/octicons-react'
import { SearchIcon } from 'lucide-react'

import { UserAvatar } from '@/components/github/user-avatar'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/hooks/use-user'

interface HeaderProps {
    onSettingsClick?: () => void
}

export const Header = memo(function Header({ onSettingsClick }: HeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const { user } = useUser()

    return (
        <header className="border-border flex h-14 shrink-0 items-center border-b px-3 py-2">
            <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center">
                    <MarkGithubIcon
                        size={24}
                        className="text-github-accent-fg mr-2"
                    />
                </div>
                <div className="relative mx-2 flex-1">
                    <Command
                        className="bg-background border-border overflow-visible rounded-md border"
                        shouldFilter={false}
                    >
                        <div className="flex items-center px-2">
                            <SearchIcon className="mr-1 h-4 w-4 shrink-0 opacity-50" />
                            <CommandInput
                                placeholder="Search repositories..."
                                className="h-9 border-0 px-0 py-2 focus-visible:ring-0 focus-visible:outline-none"
                                onFocus={() => setIsSearchOpen(true)}
                                onBlur={() =>
                                    setTimeout(
                                        () => setIsSearchOpen(false),
                                        200
                                    )
                                }
                            />
                        </div>
                        {isSearchOpen && (
                            <CommandList className="bg-popover absolute top-full left-0 z-10 mt-1 w-full rounded-md border shadow-md">
                                <CommandEmpty>
                                    No repositories found.
                                </CommandEmpty>
                                <CommandGroup heading="Recent Repositories">
                                    <CommandItem className="flex items-center">
                                        <span>github-navigator</span>
                                    </CommandItem>
                                    <CommandItem className="flex items-center">
                                        <span>my-project</span>
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        )}
                    </Command>
                </div>
                <div className="flex items-center">
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="focus:ring-ring rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none"
                                    aria-label="Open user menu"
                                >
                                    <UserAvatar
                                        user={user}
                                        size="sm"
                                        className="border-border cursor-pointer border transition-opacity hover:opacity-80"
                                    />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56"
                                sideOffset={5}
                            >
                                <div className="text-muted-foreground px-2 py-1.5 text-sm">
                                    {user.name || user.login}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={onSettingsClick}
                                    className="cursor-pointer"
                                >
                                    <GearIcon size={16} className="mr-2" />
                                    Settings
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    )
})
