import React, { memo, useMemo } from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const avatarVariants = cva('', {
    variants: {
        size: {
            sm: 'h-6 w-6',
            md: 'h-8 w-8',
            lg: 'h-10 w-10',
            xl: 'h-12 w-12',
            '2xl': 'h-16 w-16',
        },
    },
    defaultVariants: {
        size: 'md',
    },
})

interface UserAvatarProps
    extends React.ComponentProps<typeof Avatar>,
        VariantProps<typeof avatarVariants> {
    user: {
        login: string
        name?: string | null
        avatar_url: string
    }
    showFallback?: boolean
}

export const UserAvatar = memo(function UserAvatar({
    user,
    size,
    showFallback = true,
    className,
    ...props
}: UserAvatarProps) {
    const generateFallback = useMemo(() => {
        if (user.name) {
            return user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return user.login.slice(0, 2).toUpperCase()
    }, [user.login, user.name])

    return (
        <Avatar className={cn(avatarVariants({ size }), className)} {...props}>
            <AvatarImage src={user.avatar_url} alt={`${user.login}'s avatar`} />
            {showFallback && (
                <AvatarFallback className="text-xs font-medium">
                    {generateFallback}
                </AvatarFallback>
            )}
        </Avatar>
    )
})
