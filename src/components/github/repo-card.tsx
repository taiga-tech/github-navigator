import { memo } from 'react'

import { StarIcon } from '@primer/octicons-react'

import { Badge } from '@/components/ui/badge'

interface RepoCardProps {
    name: string
    visibility: 'Public' | 'Private'
    description: string
    language: string
    languageColor: string
    stars: string
}

export const RepoCard = memo(function RepoCard({
    name,
    visibility,
    description,
    language,
    languageColor,
    stars,
}: RepoCardProps) {
    return (
        <div className="border-border bg-card hover:bg-card/80 hover:border-primary rounded-lg border p-4 transition-colors">
            <div className="mb-2 flex items-center justify-between">
                <h4 className="text-primary cursor-pointer font-medium hover:underline">
                    {name}
                </h4>
                <Badge variant="outline" className="text-xs">
                    {visibility}
                </Badge>
            </div>

            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                {description}
            </p>

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: languageColor }}
                    />
                    <span>{language}</span>
                </div>
                <div className="flex items-center gap-1">
                    <StarIcon size={12} />
                    <span>{stars}</span>
                </div>
            </div>
        </div>
    )
})
