import { memo, useMemo } from 'react'

import { FileDirectoryIcon, FileIcon } from '@primer/octicons-react'

import { cn } from '@/lib/utils'

interface FileItemProps {
    name: string
    type: 'folder' | 'file'
    depth?: number
    isActive?: boolean
}

const FileItem = memo(function FileItem({
    name,
    type,
    depth = 0,
    isActive = false,
}: FileItemProps) {
    const Icon = type === 'folder' ? FileDirectoryIcon : FileIcon

    const paddingLeft = useMemo(() => `${8 + depth * 16}px`, [depth])
    const iconClassName = useMemo(
        () => (isActive ? 'text-primary' : 'text-muted-foreground'),
        [isActive]
    )
    const spanClassName = useMemo(
        () => (isActive ? 'text-primary font-medium' : 'text-foreground'),
        [isActive]
    )

    return (
        <div
            className={cn(
                'hover:bg-muted/10 flex cursor-pointer items-center gap-2 px-2 py-1 text-sm',
                {
                    'bg-primary/10': isActive,
                }
            )}
            style={{ paddingLeft }}
        >
            <Icon size={16} className={iconClassName} />
            <span className={spanClassName}>{name}</span>
        </div>
    )
})

interface FileExplorerProps {
    files?: Array<{
        name: string
        type: 'folder' | 'file'
        depth?: number
        isActive?: boolean
    }>
}

const defaultFiles = [
    { name: 'src', type: 'folder' as const, isActive: true },
    {
        name: 'components',
        type: 'folder' as const,
        depth: 1,
        isActive: true,
    },
    { name: 'button.tsx', type: 'file' as const, depth: 2 },
    { name: 'card.tsx', type: 'file' as const, depth: 2 },
    { name: 'index.ts', type: 'file' as const, depth: 1 },
    { name: 'package.json', type: 'file' as const },
    { name: 'README.md', type: 'file' as const },
]

export const FileExplorer = memo(function FileExplorer({
    files,
}: FileExplorerProps) {
    const filesToRender = useMemo(() => files || defaultFiles, [files])

    return (
        <div className="border-border bg-card overflow-hidden rounded-lg border">
            {filesToRender.map((file) => (
                <FileItem key={file.name} {...file} />
            ))}
        </div>
    )
})
