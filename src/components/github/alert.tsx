import { type ReactNode } from 'react'

import { AlertIcon, CheckIcon, InfoIcon, XIcon } from '@primer/octicons-react'

import { Alert, AlertDescription } from '@/components/ui/alert'

interface GitHubAlertProps {
    variant: 'success' | 'warning' | 'danger' | 'info'
    children: ReactNode
}

export function GitHubAlert({ variant, children }: GitHubAlertProps) {
    const getAlertConfig = (variant: string) => {
        switch (variant) {
            case 'success':
                return {
                    icon: (
                        <CheckIcon
                            size={16}
                            className="stroke-github-success-fg"
                        />
                    ),
                    className:
                        'border-github-success-fg/20 bg-github-success-fg/10',
                    textClassName: 'text-github-success-fg',
                }
            case 'warning':
                return {
                    icon: (
                        <AlertIcon
                            size={16}
                            className="stroke-github-attention-fg"
                        />
                    ),
                    className:
                        'border-github-attention-fg/20 bg-github-attention-fg/10',
                    textClassName: 'text-github-attention-fg',
                }
            case 'danger':
                return {
                    icon: (
                        <XIcon size={16} className="stroke-github-danger-fg" />
                    ),
                    className:
                        'border-github-danger-fg/20 bg-github-danger-fg/10',
                    textClassName: 'text-github-danger-fg',
                }
            case 'info':
                return {
                    icon: <InfoIcon size={16} className="stroke-primary" />,
                    className: 'border-primary/20 bg-primary/10',
                    textClassName: 'text-primary',
                }
            default:
                return {
                    icon: <InfoIcon size={16} className="stroke-primary" />,
                    className: 'border-primary/20 bg-primary/10',
                    textClassName: 'text-primary',
                }
        }
    }

    const config = getAlertConfig(variant)

    return (
        <Alert className={config.className}>
            {config.icon}
            <AlertDescription className={config.textClassName}>
                {children}
            </AlertDescription>
        </Alert>
    )
}
