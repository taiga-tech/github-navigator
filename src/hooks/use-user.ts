import type { GitHubUser } from '@/lib/schemas'

import { useCallback, useEffect, useState } from 'react'

import { Storage } from '@plasmohq/storage'

import { getCurrentUser } from '@/lib/github-api'

import { useAuth } from './use-auth'

// Cache configuration
const CACHE_PREFIX = 'user_cache_'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

// Cached user data structure
interface CachedUserData {
    user: GitHubUser
    timestamp: number
    tokenHash: string // To invalidate cache when token changes
}

// User hook return interface
export interface UseUserReturn {
    user: GitHubUser | null
    isLoading: boolean
    error: string | null
    isCached: boolean
    lastUpdated: Date | null
    refetch: () => Promise<void>
    clearCache: () => Promise<void>
}

// Create a simple hash from token for cache invalidation
function hashToken(token: string): string {
    // Simple hash function - in production, consider using a proper hash
    let hash = 0
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
}

// Storage instance
const storage = new Storage()

export function useUser(): UseUserReturn {
    const { authState, isAuthenticated } = useAuth()
    const [user, setUser] = useState<GitHubUser | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isCached, setIsCached] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Generate cache key based on user ID and token
    const getCacheKey = useCallback(
        (userId: number, tokenHash: string): string => {
            return `${CACHE_PREFIX}${userId}_${tokenHash}`
        },
        []
    )

    // Check if cached data is still valid
    const isCacheValid = useCallback(
        (cachedData: CachedUserData, currentTokenHash: string): boolean => {
            const now = Date.now()
            const isNotExpired = now - cachedData.timestamp < CACHE_TTL
            const isTokenSame = cachedData.tokenHash === currentTokenHash

            return isNotExpired && isTokenSame
        },
        []
    )

    // Get user data from cache
    const getCachedUser = useCallback(
        async (
            userId: number,
            tokenHash: string
        ): Promise<GitHubUser | null> => {
            try {
                const cacheKey = getCacheKey(userId, tokenHash)
                const cachedData = (await storage.get(
                    cacheKey
                )) as CachedUserData | null

                if (cachedData && isCacheValid(cachedData, tokenHash)) {
                    console.log('Using cached user data')
                    setIsCached(true)
                    setLastUpdated(new Date(cachedData.timestamp))
                    return cachedData.user
                }

                // Clean up expired cache
                if (cachedData) {
                    await storage.remove(cacheKey)
                }

                return null
            } catch (error) {
                console.warn('Failed to retrieve cached user data:', error)
                return null
            }
        },
        [getCacheKey, isCacheValid]
    )

    // Cache user data
    const cacheUser = useCallback(
        async (userData: GitHubUser, tokenHash: string): Promise<void> => {
            try {
                const cacheKey = getCacheKey(userData.id, tokenHash)
                const cachedData: CachedUserData = {
                    user: userData,
                    timestamp: Date.now(),
                    tokenHash,
                }

                await storage.set(cacheKey, cachedData)
                console.log('User data cached successfully')
            } catch (error) {
                console.warn('Failed to cache user data:', error)
            }
        },
        [getCacheKey]
    )

    // Fetch user data from API
    const fetchUserFromAPI = useCallback(
        async (tokenHash: string): Promise<GitHubUser> => {
            console.log('Fetching user data from GitHub API')
            setIsCached(false)

            const userData = (await getCurrentUser()) as GitHubUser

            // Cache the fetched data
            await cacheUser(userData, tokenHash)
            setLastUpdated(new Date())

            return userData
        },
        [cacheUser]
    )

    // Main fetch function with cache logic
    const fetchUser = useCallback(
        async (forceRefresh: boolean = false): Promise<void> => {
            if (
                !isAuthenticated ||
                !authState?.token?.access_token ||
                !authState?.user?.id
            ) {
                setUser(null)
                setError(null)
                setIsCached(false)
                setLastUpdated(null)
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const tokenHash = hashToken(authState.token.access_token)
                let userData: GitHubUser | null = null

                // Try cache first unless force refresh is requested
                if (!forceRefresh) {
                    userData = await getCachedUser(authState.user.id, tokenHash)
                }

                // Fetch from API if no valid cache data
                if (!userData) {
                    userData = await fetchUserFromAPI(tokenHash)
                }

                setUser(userData)
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch user data'
                setError(errorMessage)
                console.error('Failed to fetch user:', err)
            } finally {
                setIsLoading(false)
            }
        },
        [
            isAuthenticated,
            authState?.token?.access_token,
            authState?.user?.id,
            getCachedUser,
            fetchUserFromAPI,
        ]
    )

    // Public refetch function
    const refetch = useCallback(async (): Promise<void> => {
        await fetchUser(true) // Force refresh
    }, [fetchUser])

    // Clear all cached user data
    const clearCache = useCallback(async (): Promise<void> => {
        try {
            // Get all keys and remove user cache entries
            // Note: Plasmo storage doesn't have a direct way to get all keys,
            // so we'll clear based on known patterns
            const commonUserIds = [authState?.user?.id].filter(Boolean)

            for (const userId of commonUserIds) {
                // Try to clear cache for different token hashes
                // This is a best-effort cleanup
                const possibleKeys = [
                    getCacheKey(
                        userId as number,
                        hashToken(authState?.token?.access_token || '')
                    ),
                ]

                for (const key of possibleKeys) {
                    await storage.remove(key).catch(() => {
                        // Ignore errors for non-existent keys
                    })
                }
            }

            console.log('User cache cleared')

            // Refetch after clearing cache
            if (isAuthenticated) {
                await fetchUser(true)
            }
        } catch (error) {
            console.warn('Failed to clear user cache:', error)
        }
    }, [
        authState?.user?.id,
        authState?.token?.access_token,
        getCacheKey,
        isAuthenticated,
        fetchUser,
    ])

    // Auto-fetch when authentication state changes
    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    // Periodic cache validation (every 1 minute)
    useEffect(() => {
        if (!isAuthenticated || !user) {
            return
        }

        const interval = setInterval(async () => {
            // Check if current cache is still valid
            if (authState?.token?.access_token && authState?.user?.id) {
                const tokenHash = hashToken(authState.token.access_token)
                const cachedData = (await storage.get(
                    getCacheKey(authState.user.id, tokenHash)
                )) as CachedUserData | null

                if (cachedData && !isCacheValid(cachedData, tokenHash)) {
                    console.log('Cache expired, refreshing user data')
                    await fetchUser(true)
                }
            }
        }, 60 * 1000) // Check every minute

        return () => clearInterval(interval)
    }, [
        isAuthenticated,
        user,
        authState?.token?.access_token,
        authState?.user?.id,
        getCacheKey,
        isCacheValid,
        fetchUser,
    ])

    return {
        user,
        isLoading,
        error,
        isCached,
        lastUpdated,
        refetch,
        clearCache,
    }
}
