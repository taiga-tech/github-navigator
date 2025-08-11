import type { ReactNode } from 'react'

import { memo } from 'react'

interface PopupContainerProps {
    children: ReactNode
    className?: string
}

/**
 * Container component for the popup with fixed 600x600px dimensions
 * Provides the base structure for the Chrome extension popup
 */
export const PopupContainer = memo(function PopupContainer({
    children,
    className = '',
}: PopupContainerProps) {
    return (
        <div
            className={`bg-background text-foreground flex h-150 w-150 flex-col ${className}`}
            style={{
                // Fallback for browsers that don't support h-150/w-150 classes
                width: '600px',
                height: '600px',
            }}
        >
            {children}
        </div>
    )
})

export type { PopupContainerProps }
