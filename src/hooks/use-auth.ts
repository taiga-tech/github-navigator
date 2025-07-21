import type { AuthState } from '@/lib/schemas'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useStorage } from '@plasmohq/storage/hook'

import {
    authenticateWithGitHub,
    clearAuthState,
    getAuthState,
    isAuthenticated,
    isTokenExpiringWithin,
    isTokenValid,
    signOut,
} from '@/lib/auth'

export interface UseAuthReturn {
    authState: AuthState | null
    isLoading: boolean
    isAuthenticated: boolean
    isTokenExpiring: boolean
    error: string | null
    signIn: () => Promise<void>
    signOut: () => Promise<void>
    refreshAuthState: () => Promise<void>
    clearError: () => void
}

export function useAuth(): UseAuthReturn {
    const [authState, setAuthState] = useStorage<AuthState | null>(
        'authState',
        null
    )
    const [isLoading, setIsLoading] = useState(false)
    const [isTokenExpiring, setIsTokenExpiring] = useState(false)
    const [error, setError] = useState<string | null>(null)

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

    // Sign in with GitHub
    const signIn = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const newAuthState = await authenticateWithGitHub()
            setAuthState(newAuthState)
            await updateAuthenticationStatus()
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Authentication failed'
            setError(errorMessage)
            console.error('Sign in failed:', err)
        } finally {
            setIsLoading(false)
        }
    }, [setAuthState, updateAuthenticationStatus])

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
        setError(null)

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
                } else {
                    setComputedIsAuthenticated(true)
                }
            } else {
                setComputedIsAuthenticated(false)
            }

            await updateAuthenticationStatus()
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Failed to refresh auth state'
            setError(errorMessage)
            console.error('Failed to refresh auth state:', err)
        } finally {
            setIsLoading(false)
        }
    }, [setAuthState, updateAuthenticationStatus])

    // Clear error
    const clearError = useCallback(() => {
        setError(null)
    }, [])

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

    return {
        authState,
        isLoading,
        isAuthenticated: finalIsAuthenticated,
        isTokenExpiring,
        error,
        signIn,
        signOut: handleSignOut,
        refreshAuthState,
        clearError,
    }
}
