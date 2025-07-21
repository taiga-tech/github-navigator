import React, { memo, useMemo } from 'react'

import { AlertIcon, MarkGithubIcon, SyncIcon } from '@primer/octicons-react'

import { GitHubButton } from '@/components/github/button'
import { GitHubCard } from '@/components/github/card'
import { OAuthDebugInfo } from '@/components/github/oauth-debug'
import { UserAvatar } from '@/components/github/user-avatar'
import { useAuth } from '@/hooks/use-auth'

interface AuthComponentProps {
    onAuthSuccess?: () => void
}

// Authenticated user component (memoized)
const AuthenticatedUserComponent = memo(function AuthenticatedUserComponent({
    authState,
    isLoading,
    isTokenExpiring,
    signIn,
    signOut,
    refreshAuthState,
}: {
    authState: NonNullable<ReturnType<typeof useAuth>['authState']>
    isLoading: boolean
    isTokenExpiring: boolean
    signIn: () => Promise<void>
    signOut: () => Promise<void>
    refreshAuthState: () => Promise<void>
}) {
    const userDisplayName = useMemo(
        () => authState.user.name || authState.user.login,
        [authState.user.name, authState.user.login]
    )

    const refreshButton = useMemo(
        () => (
            <GitHubButton
                variant="outline"
                size="sm"
                onClick={refreshAuthState}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <SyncIcon size={16} className="mr-2 animate-spin" />
                        Refreshing...
                    </>
                ) : (
                    <>
                        <SyncIcon size={16} className="mr-2" />
                        Refresh
                    </>
                )}
            </GitHubButton>
        ),
        [refreshAuthState, isLoading]
    )

    const signOutButton = useMemo(
        () => (
            <GitHubButton
                variant="outline"
                size="sm"
                onClick={signOut}
                disabled={isLoading}
            >
                Sign Out
            </GitHubButton>
        ),
        [signOut, isLoading]
    )

    return (
        <div className="space-y-4">
            {/* Token expiring warning */}
            {isTokenExpiring && (
                <GitHubCard
                    title="Token Expiring"
                    status={{
                        label: 'Warning',
                        variant: 'warning',
                    }}
                >
                    <div className="flex items-center space-x-2 text-sm">
                        <AlertIcon size={16} className="text-yellow-600" />
                        <span>
                            Your GitHub token will expire soon. Please
                            re-authenticate.
                        </span>
                    </div>
                    <GitHubButton
                        onClick={signIn}
                        disabled={isLoading}
                        className="mt-2"
                        size="sm"
                    >
                        {isLoading ? (
                            <>
                                <SyncIcon
                                    size={16}
                                    className="mr-2 animate-spin"
                                />
                                Refreshing...
                            </>
                        ) : (
                            'Refresh Token'
                        )}
                    </GitHubButton>
                </GitHubCard>
            )}

            {/* User info */}
            <GitHubCard
                title="Authenticated"
                status={{
                    label: 'Connected',
                    variant: 'success',
                }}
            >
                <div className="flex items-center space-x-3">
                    <UserAvatar user={authState.user} size="lg" />
                    <div className="flex-1">
                        <div className="font-medium">{userDisplayName}</div>
                        <div className="text-muted-foreground text-sm">
                            @{authState.user.login}
                        </div>
                        {authState.user.email && (
                            <div className="text-muted-foreground text-xs">
                                {authState.user.email}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex space-x-2">
                    {refreshButton}
                    {signOutButton}
                </div>
            </GitHubCard>
        </div>
    )
})

// Unauthenticated component (memoized)
const UnauthenticatedComponent = memo(function UnauthenticatedComponent({
    error,
    isLoading,
    signIn,
    clearError,
}: {
    error: string | null
    isLoading: boolean
    signIn: () => Promise<void>
    clearError: () => void
}) {
    const signInButton = useMemo(
        () => (
            <GitHubButton
                onClick={signIn}
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? (
                    <>
                        <SyncIcon size={16} className="mr-2 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <MarkGithubIcon size={16} className="mr-2" />
                        Sign in with GitHub
                    </>
                )}
            </GitHubButton>
        ),
        [signIn, isLoading]
    )

    return (
        <div className="space-y-4">
            {/* Error display */}
            {error && (
                <GitHubCard
                    title="Authentication Error"
                    status={{
                        label: 'Error',
                        variant: 'danger',
                    }}
                >
                    <div className="flex items-start space-x-2">
                        <AlertIcon
                            size={16}
                            className="mt-0.5 flex-shrink-0 text-red-600"
                        />
                        <div className="flex-1">
                            <p className="text-sm text-red-700">{error}</p>
                            <GitHubButton
                                variant="outline"
                                size="sm"
                                onClick={clearError}
                                className="mt-2"
                            >
                                Dismiss
                            </GitHubButton>
                        </div>
                    </div>
                </GitHubCard>
            )}

            {/* Sign in card */}
            <GitHubCard
                title="Connect to GitHub"
                status={{
                    label: 'Not Connected',
                    variant: 'info',
                }}
            >
                <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <MarkGithubIcon
                            size={48}
                            className="text-muted-foreground"
                        />
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-medium">Sign in to GitHub</h3>
                        <p className="text-muted-foreground text-sm">
                            Connect your GitHub account to access repositories,
                            notifications, and more.
                        </p>
                    </div>

                    <div className="text-muted-foreground space-y-2 text-xs">
                        <p>This extension will request access to:</p>
                        <ul className="list-inside list-disc space-y-1 text-left">
                            <li>Your public and private repositories</li>
                            <li>Your notifications</li>
                            <li>Your email address</li>
                        </ul>
                    </div>

                    {signInButton}
                </div>
            </GitHubCard>

            {/* OAuth Debug Info - only show in development */}
            {process.env.NODE_ENV === 'development' && <OAuthDebugInfo />}
        </div>
    )
})

export const AuthComponent = memo(function AuthComponent({
    onAuthSuccess,
}: AuthComponentProps) {
    const {
        authState,
        isLoading,
        isAuthenticated,
        isTokenExpiring,
        error,
        signIn,
        signOut,
        refreshAuthState,
        clearError,
    } = useAuth()

    // Handle successful authentication
    React.useEffect(() => {
        if (isAuthenticated && onAuthSuccess) {
            onAuthSuccess()
        }
    }, [isAuthenticated, onAuthSuccess])

    // Conditional rendering with memoized components
    if (isAuthenticated && authState?.user) {
        return (
            <AuthenticatedUserComponent
                authState={authState}
                isLoading={isLoading}
                isTokenExpiring={isTokenExpiring}
                signIn={signIn}
                signOut={signOut}
                refreshAuthState={refreshAuthState}
            />
        )
    }

    return (
        <UnauthenticatedComponent
            error={error}
            isLoading={isLoading}
            signIn={signIn}
            clearError={clearError}
        />
    )
})

// Higher-order component to protect routes that require authentication
interface AuthGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export const AuthGuard = memo(function AuthGuard({
    children,
    fallback,
}: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <SyncIcon
                    size={24}
                    className="text-muted-foreground animate-spin"
                />
            </div>
        )
    }

    if (!isAuthenticated) {
        return fallback || <AuthComponent />
    }

    return <>{children}</>
})
