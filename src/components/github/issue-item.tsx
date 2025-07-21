import { memo, useMemo } from 'react'

import { IssueClosedIcon, IssueOpenedIcon } from '@primer/octicons-react'

import { Badge } from '@/components/ui/badge'

interface IssueItemProps {
    title: string
    number: number
    author: string
    status: 'open' | 'closed'
    labels: Array<{
        name: string
        type: 'enhancement' | 'bug' | 'feature'
    }>
}

const getLabelColor = (type: string) => {
    switch (type) {
        case 'enhancement':
            return 'bg-github-success-fg/10 text-github-success-fg border-github-success-fg/20'
        case 'bug':
            return 'bg-github-danger-fg/10 text-github-danger-fg border-github-danger-fg/20'
        case 'feature':
            return 'bg-primary/10 text-primary border-primary/20'
        default:
            return 'bg-muted text-muted-foreground'
    }
}

export const IssueItem = memo(function IssueItem({
    title,
    number,
    author,
    status,
    labels,
}: IssueItemProps) {
    const statusText = useMemo(() => {
        return status === 'open' ? 'opened' : 'closed'
    }, [status])

    return (
        <div className="border-border hover:bg-muted/5 flex items-start gap-3 border-b p-3 transition-colors">
            <div className="mt-1">
                {status === 'open' ? (
                    <IssueOpenedIcon
                        size={16}
                        className="text-github-success-fg"
                    />
                ) : (
                    <IssueClosedIcon
                        size={16}
                        className="text-github-done-fg"
                    />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h4 className="text-foreground hover:text-primary cursor-pointer font-medium">
                    {title}
                </h4>
                <p className="text-muted-foreground text-sm">
                    #{number} {statusText} by {author}
                </p>
            </div>

            <div className="flex flex-wrap gap-1">
                {labels.map((label) => (
                    <Badge
                        key={label.name}
                        variant="outline"
                        className={`text-xs ${getLabelColor(label.type)}`}
                    >
                        {label.name}
                    </Badge>
                ))}
            </div>
        </div>
    )
})
