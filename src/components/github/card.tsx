import { type ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GitHubCardProps {
    title: string
    status?: {
        label: string
        variant: 'success' | 'warning' | 'danger' | 'info'
    }
    children: ReactNode
}

export function GitHubCard({ title, status, children }: GitHubCardProps) {
    const getStatusColor = (variant: string) => {
        switch (variant) {
            case 'success':
                return 'border-github-success-fg/20 bg-github-success-fg/10 text-github-success-fg'
            case 'warning':
                return 'border-github-attention-fg/20 bg-github-attention-fg/10 text-github-attention-fg'
            case 'danger':
                return 'border-github-danger-fg/20 bg-github-danger-fg/10 text-github-danger-fg'
            case 'info':
                return 'border-primary/20 bg-primary/10 text-primary'
            default:
                return 'border-muted bg-muted/10 text-muted-foreground'
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">{title}</CardTitle>
                {status && (
                    <Badge
                        variant="secondary"
                        className={getStatusColor(status.variant)}
                    >
                        {status.label}
                    </Badge>
                )}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}
