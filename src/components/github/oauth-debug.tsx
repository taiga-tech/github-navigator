'use client'

import { useEffect, useState } from 'react'

import { CopyIcon, InfoIcon } from '@primer/octicons-react'

import { getExtensionInfo } from '@/lib/auth'

import { GitHubButton } from '@/components/github/button'
import { GitHubCard } from '@/components/github/card'

interface ExtensionInfo {
    extensionId: string | null
    callbackUrl: string
}

export function OAuthDebugInfo() {
    const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo>({
        extensionId: null,
        callbackUrl: '',
    })
    const [copied, setCopied] = useState<string | null>(null)

    useEffect(() => {
        const info = getExtensionInfo()
        setExtensionInfo(info)
    }, [])

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(type)
            setTimeout(() => setCopied(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <GitHubCard
            title="OAuth Configuration Debug"
            status={{
                label: 'Debug Info',
                variant: 'info',
            }}
        >
            <div className="space-y-4">
                <div className="flex items-start space-x-2">
                    <InfoIcon
                        size={16}
                        className="mt-0.5 flex-shrink-0 text-blue-600"
                    />
                    <div className="flex-1 text-sm">
                        <p className="text-muted-foreground">
                            Use this information to configure your GitHub OAuth
                            App callback URL.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">
                            Extension ID:
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                            <code className="bg-muted flex-1 rounded px-2 py-1 font-mono text-sm">
                                {extensionInfo.extensionId || 'Not available'}
                            </code>
                            {extensionInfo.extensionId && (
                                <GitHubButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        copyToClipboard(
                                            extensionInfo.extensionId!,
                                            'extensionId'
                                        )
                                    }
                                    className="px-2"
                                >
                                    <CopyIcon size={14} />
                                    {copied === 'extensionId' ? 'Copied!' : ''}
                                </GitHubButton>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            OAuth Callback URL:
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                            <code className="bg-muted flex-1 rounded px-2 py-1 font-mono text-sm break-all">
                                {extensionInfo.callbackUrl}
                            </code>
                            <GitHubButton
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    copyToClipboard(
                                        extensionInfo.callbackUrl,
                                        'callbackUrl'
                                    )
                                }
                                className="px-2"
                            >
                                <CopyIcon size={14} />
                                {copied === 'callbackUrl' ? 'Copied!' : ''}
                            </GitHubButton>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-2">
                    <h4 className="mb-2 text-sm font-medium">
                        Setup Instructions:
                    </h4>
                    <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
                        <li>
                            Go to{' '}
                            <a
                                href="https://github.com/settings/applications/new"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                GitHub OAuth Apps
                            </a>
                        </li>
                        <li>Create a new OAuth App</li>
                        <li>Use the callback URL shown above</li>
                        <li>Copy Client ID and Secret to your .env file</li>
                    </ol>
                </div>
            </div>
        </GitHubCard>
    )
}
