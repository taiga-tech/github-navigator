import type { AuthState } from '@/lib/schemas'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useStorage } from '@plasmohq/storage/hook'

import {
    AuthError,
    authenticateWithGitHub,
    clearAuthState,
    getAuthState,
    isAuthenticated,
    isTokenExpiringWithin,
    isTokenValid,
    signOut,
} from '@/lib/auth'

// Enhanced error types for better error handling
interface AuthErrorDetails {
    code: string
    message: string
    type: 'network' | 'config' | 'auth' | 'rate_limit' | 'unknown'
    isRetryable: boolean
}

// Parse error into structured format
function parseAuthError(error: unknown): AuthErrorDetails {
    if (error instanceof AuthError) {
        let type: AuthErrorDetails['type'] = 'auth'
        let isRetryable = false

        switch (error.code) {
            case 'CHROME_IDENTITY_UNAVAILABLE':
            case 'MISSING_CLIENT_ID':
            case 'MISSING_CLIENT_SECRET':
            case 'CONFIG_VALIDATION_ERROR':
                type = 'config'
                isRetryable = false
                break
            case 'TOKEN_EXCHANGE_ERROR':
            case 'USER_FETCH_ERROR':
                type = 'auth'
                isRetryable = error.status ? error.status >= 500 : false
                break
            case 'OAUTH_FLOW_ERROR':
                type = 'auth'
                isRetryable = true
                break
            default:
                type = 'unknown'
                isRetryable = true
        }

        return {
            code: error.code,
            message: error.message,
            type,
            isRetryable,
        }
    }

    if (error instanceof Error) {
        // Network errors are typically retryable
        const isNetworkError =
            error.message.toLowerCase().includes('network') ||
            error.message.toLowerCase().includes('fetch') ||
            error.message.toLowerCase().includes('connection')

        return {
            code: 'UNKNOWN_ERROR',
            message: error.message,
            type: isNetworkError ? 'network' : 'unknown',
            isRetryable: isNetworkError,
        }
    }

    return {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        type: 'unknown',
        isRetryable: true,
    }
}

// Show notification if available
function showNotification(
    title: string,
    message: string,
    type: 'info' | 'error' = 'error'
): void {
    if (typeof chrome !== 'undefined' && chrome.notifications) {
        // TODO: Use a more appropriate icon based on the type
        const icon = chrome.runtime.getURL(
            chrome.runtime.getManifest().icons['48']
        )
        const iconUrl = type === 'error' ? icon : icon

        chrome.notifications
            .create({
                type: 'basic',
                iconUrl,
                title,
                message,
            })
            .catch((err) => {
                console.warn('Failed to show notification:', err)
            })
    }
}

export interface UseAuthReturn {
    authState: AuthState | null
    isLoading: boolean
    isAuthenticated: boolean
    isTokenExpiring: boolean
    error: string | null
    errorDetails: AuthErrorDetails | null
    retryCount: number
    canRetry: boolean
    signIn: () => Promise<void>
    signOut: () => Promise<void>
    refreshAuthState: () => Promise<void>
    clearError: () => void
    retryLastOperation: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
    const [authState, setAuthState] = useStorage<AuthState | null>(
        'authState',
        null
    )
    const [isLoading, setIsLoading] = useState(false)
    const [isTokenExpiring, setIsTokenExpiring] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [errorDetails, setErrorDetails] = useState<AuthErrorDetails | null>(
        null
    )
    const [retryCount, setRetryCount] = useState(0)
    const [lastOperation, setLastOperation] = useState<
        'signIn' | 'refreshAuth' | null
    >(null)

    // Computed authentication status
    const [computedIsAuthenticated, setComputedIsAuthenticated] =
        useState(false)

    // Refs to prevent unnecessary interval recreation
    const tokenCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const validationIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Update computed authentication status
    const updateAuthenticationStatus = useCallback(async () => {
        try {
            const authenticated = await isAuthenticated()
            setComputedIsAuthenticated(authenticated)
        } catch (err) {
            console.error('Failed to check authentication:', err)
            setComputedIsAuthenticated(false)
        }
    }, [])

    // Enhanced error handling
    const handleError = useCallback(
        (err: unknown, operation?: 'signIn' | 'refreshAuth') => {
            const errorInfo = parseAuthError(err)
            setError(errorInfo.message)
            setErrorDetails(errorInfo)

            if (operation) {
                setLastOperation(operation)
            }

            // Show notification for critical errors
            if (errorInfo.type === 'config') {
                showNotification(
                    'Configuration Error',
                    'There is an issue with GitHub OAuth settings. Please contact your administrator.',
                    'error'
                )
            } else if (errorInfo.type === 'network') {
                showNotification(
                    'Network Error',
                    'There is a network connection issue. Please try again later.',
                    'error'
                )
            } else if (errorInfo.type === 'rate_limit') {
                showNotification(
                    'Rate Limit Exceeded',
                    'API usage limit has been reached. Please wait a moment before trying again.',
                    'error'
                )
            }

            console.error(
                `Authentication ${operation || 'operation'} failed:`,
                err
            )
        },
        []
    )

    // Clear error and reset retry state
    const clearError = useCallback(() => {
        setError(null)
        setErrorDetails(null)
        setRetryCount(0)
        setLastOperation(null)
    }, [])

    // Retry last operation with exponential backoff
    const retryLastOperation = useCallback(async () => {
        if (!lastOperation || !errorDetails?.isRetryable) {
            return
        }

        const maxRetries = 3
        if (retryCount >= maxRetries) {
            showNotification(
                'Retry Limit Reached',
                'Maximum retry attempts reached. Please wait a moment before trying again.',
                'error'
            )
            return
        }

        // Exponential backoff delay
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s...

        if (delay > 1000) {
            showNotification(
                'Retrying',
                `Retrying in ${delay / 1000} seconds...`,
                'info'
            )
            await new Promise((resolve) => setTimeout(resolve, delay))
        }

        setRetryCount((prev) => prev + 1)

        if (lastOperation === 'signIn') {
            // Re-execute sign in operation
            setIsLoading(true)
            try {
                const newAuthState = await authenticateWithGitHub()
                setAuthState(newAuthState)
                await updateAuthenticationStatus()

                // Success notification
                showNotification(
                    'Authentication Successful',
                    'GitHub account authentication completed successfully.',
                    'info'
                )

                // Reset retry count on success
                setRetryCount(0)
                setLastOperation(null)
            } catch (err) {
                handleError(err, 'signIn')
            } finally {
                setIsLoading(false)
            }
        } else if (lastOperation === 'refreshAuth') {
            // Re-execute refresh auth operation
            setIsLoading(true)
            try {
                const currentAuthState = await getAuthState()
                setAuthState(currentAuthState)

                // Check if token is still valid
                if (currentAuthState && currentAuthState.isAuthenticated) {
                    const valid = await isTokenValid()
                    if (!valid) {
                        await clearAuthState()
                        setAuthState(null)
                        setComputedIsAuthenticated(false)

                        showNotification(
                            'Session Expired',
                            'Your GitHub session has expired. Please log in again.',
                            'info'
                        )
                    } else {
                        setComputedIsAuthenticated(true)
                    }
                } else {
                    setComputedIsAuthenticated(false)
                }

                await updateAuthenticationStatus()
            } catch (err) {
                handleError(err, 'refreshAuth')
            } finally {
                setIsLoading(false)
            }
        }
    }, [
        errorDetails?.isRetryable,
        lastOperation,
        retryCount,
        setAuthState,
        handleError,
        updateAuthenticationStatus,
    ])

    // Sign in with GitHub
    const signIn = useCallback(async () => {
        setIsLoading(true)
        clearError()

        try {
            const newAuthState = await authenticateWithGitHub()
            setAuthState(newAuthState)
            await updateAuthenticationStatus()

            // Success notification
            showNotification(
                'Authentication Successful',
                'GitHub account authentication completed successfully.',
                'info'
            )

            // Reset retry count on success
            setRetryCount(0)
            setLastOperation(null)
        } catch (err) {
            handleError(err, 'signIn')
        } finally {
            setIsLoading(false)
        }
    }, [setAuthState, updateAuthenticationStatus, handleError, clearError])

    // Sign out
    const handleSignOut = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            await signOut()
            setAuthState(null)
            setComputedIsAuthenticated(false)
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Sign out failed'
            setError(errorMessage)
            console.error('Sign out failed:', err)
        } finally {
            setIsLoading(false)
        }
    }, [setAuthState])

    // Refresh authentication state
    const refreshAuthState = useCallback(async () => {
        setIsLoading(true)
        clearError()

        try {
            const currentAuthState = await getAuthState()
            setAuthState(currentAuthState)

            // Check if token is still valid
            if (currentAuthState && currentAuthState.isAuthenticated) {
                const valid = await isTokenValid()
                if (!valid) {
                    await clearAuthState()
                    setAuthState(null)
                    setComputedIsAuthenticated(false)

                    showNotification(
                        'Session Expired',
                        'Your GitHub session has expired. Please log in again.',
                        'info'
                    )
                } else {
                    setComputedIsAuthenticated(true)
                }
            } else {
                setComputedIsAuthenticated(false)
            }

            await updateAuthenticationStatus()
        } catch (err) {
            handleError(err, 'refreshAuth')
        } finally {
            setIsLoading(false)
        }
    }, [setAuthState, updateAuthenticationStatus, handleError, clearError])

    // Check if token is expiring (within 30 days)
    const checkTokenExpiration = useCallback(async () => {
        try {
            const expiring = await isTokenExpiringWithin(30)
            setIsTokenExpiring(expiring)
        } catch (err) {
            console.error('Failed to check token expiration:', err)
        }
    }, [])

    // Validate token and clear auth if invalid
    const validateToken = useCallback(async () => {
        try {
            const valid = await isTokenValid()
            if (!valid) {
                await clearAuthState()
                setAuthState(null)
                setComputedIsAuthenticated(false)
            } else {
                setComputedIsAuthenticated(true)
            }
        } catch (err) {
            console.error('Token validation failed:', err)
            setComputedIsAuthenticated(false)
        }
    }, [setAuthState])

    // Clear intervals helper
    const clearIntervals = useCallback(() => {
        if (tokenCheckIntervalRef.current) {
            clearInterval(tokenCheckIntervalRef.current)
            tokenCheckIntervalRef.current = null
        }
        if (validationIntervalRef.current) {
            clearInterval(validationIntervalRef.current)
            validationIntervalRef.current = null
        }
    }, [])

    // Combined effect for initialization and periodic checks
    useEffect(() => {
        // Initialize auth state
        refreshAuthState()
        updateAuthenticationStatus()

        // Set up periodic checks if authenticated
        if (authState?.isAuthenticated) {
            // Clear existing intervals
            clearIntervals()

            // Initial checks
            checkTokenExpiration()
            validateToken()

            // Set up intervals
            tokenCheckIntervalRef.current = setInterval(
                checkTokenExpiration,
                60 * 60 * 1000 // 1 hour
            )
            validationIntervalRef.current = setInterval(
                validateToken,
                24 * 60 * 60 * 1000 // 24 hours
            )
        } else {
            clearIntervals()
            setComputedIsAuthenticated(false)
        }

        // Cleanup on unmount
        return () => {
            clearIntervals()
        }
    }, [
        authState?.isAuthenticated,
        refreshAuthState,
        updateAuthenticationStatus,
        checkTokenExpiration,
        validateToken,
        clearIntervals,
    ])

    // Memoize the final authentication status
    const finalIsAuthenticated = useMemo(
        () => computedIsAuthenticated && authState?.isAuthenticated === true,
        [computedIsAuthenticated, authState?.isAuthenticated]
    )

    // Compute retry capability
    const canRetry = useMemo(
        () => errorDetails?.isRetryable === true && retryCount < 3,
        [errorDetails?.isRetryable, retryCount]
    )

    return {
        authState,
        isLoading,
        isAuthenticated: finalIsAuthenticated,
        isTokenExpiring,
        error,
        errorDetails,
        retryCount,
        canRetry,
        signIn,
        signOut: handleSignOut,
        refreshAuthState,
        clearError,
        retryLastOperation,
    }
}
