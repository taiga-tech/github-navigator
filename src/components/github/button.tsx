import type { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'

interface GitHubButtonProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger'
    size?: 'sm' | 'default' | 'lg'
    className?: string
    onClick?: () => void
    disabled?: boolean
}

export function GitHubButton({
    variant = 'primary',
    size = 'default',
    children,
    className,
    onClick,
    disabled = false,
}: PropsWithChildren<GitHubButtonProps>) {
    const getVariantClass = (variant: string) => {
        switch (variant) {
            case 'primary':
                return 'bg-primary text-primary-foreground hover:bg-primary/90'
            case 'secondary':
                return 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
            case 'outline':
                return 'border border-border bg-background hover:bg-accent text-accent-foreground'
            case 'danger':
                return 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            default:
                return 'bg-primary text-primary-foreground hover:bg-primary/90'
        }
    }

    const getSizeClass = (size: string) => {
        switch (size) {
            case 'sm':
                return 'h-8 px-3 text-xs'
            case 'default':
                return 'h-9 px-4 py-2'
            case 'lg':
                return 'h-10 px-8'
            default:
                return 'h-9 px-4 py-2'
        }
    }

    return (
        <Button
            className={cn(
                'cursor-pointer rounded-md font-medium transition-colors',
                getVariantClass(variant),
                getSizeClass(size),
                className
            )}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </Button>
    )
}
