import { Storage } from '@plasmohq/storage'

import {
    type AuthState,
    AuthStateSchema,
    type GitHubToken,
    GitHubTokenSchema,
    type GitHubUser,
    GitHubUserSchema,
    safeValidateData,
    validateData,
} from '@/lib/schemas'

// GitHub OAuth configuration with validation
function validateEnvironmentVariables(): {
    clientId: string
    clientSecret: string
} {
    const clientId = process.env.PLASMO_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.PLASMO_PUBLIC_GITHUB_CLIENT_SECRET

    if (!clientId) {
        throw new AuthError(
            'GitHub Client ID is not configured. Please set PLASMO_PUBLIC_GITHUB_CLIENT_ID environment variable.',
            'MISSING_CLIENT_ID'
        )
    }

    if (!clientSecret) {
        throw new AuthError(
            'GitHub Client Secret is not configured. Please set PLASMO_PUBLIC_GITHUB_CLIENT_SECRET environment variable.',
            'MISSING_CLIENT_SECRET'
        )
    }

    // Basic validation for GitHub Client ID format
    if (!clientId.match(/^[A-Za-z0-9]{20}$/)) {
        console.warn(
            'GitHub Client ID format may be invalid. Expected 20 alphanumeric characters.'
        )
    }

    // Basic validation for GitHub Client Secret format
    if (!clientSecret.match(/^[A-Za-z0-9]{40}$/)) {
        console.warn(
            'GitHub Client Secret format may be invalid. Expected 40 alphanumeric characters.'
        )
    }

    return { clientId, clientSecret }
}

// Get validated environment variables
function getGitHubConfig() {
    try {
        return validateEnvironmentVariables()
    } catch (error) {
        if (error instanceof AuthError) {
            console.error('Environment configuration error:', error.message)
            throw error
        }
        throw new AuthError(
            'Failed to validate GitHub OAuth configuration',
            'CONFIG_VALIDATION_ERROR'
        )
    }
}

const GITHUB_SCOPES = ['notifications', 'public_repo', 'repo', 'user:email']

// Get redirect URI safely
function getRedirectURI(): string {
    if (typeof chrome !== 'undefined' && chrome.identity) {
        const redirectURL = chrome.identity.getRedirectURL()
        console.log('Chrome Extension Redirect URL:', redirectURL)
        return redirectURL
    }
    return 'https://github-navigator.extension/oauth/callback'
}

// Helper function to get the current extension ID and callback URL
export function getExtensionInfo(): {
    extensionId: string | null
    callbackUrl: string
} {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        const extensionId = chrome.runtime.id
        const callbackUrl = `https://${extensionId}.chromiumapp.org/`
        return { extensionId, callbackUrl }
    }
    return {
        extensionId: null,
        callbackUrl: 'https://github-navigator.extension/oauth/callback',
    }
}

// Storage instance
const storage = new Storage()

// Authentication error types
export class AuthError extends Error {
    constructor(
        message: string,
        public code: string,
        public status?: number
    ) {
        super(message)
        this.name = 'AuthError'
    }
}

// GitHub OAuth 2.0 authentication flow
export async function authenticateWithGitHub(): Promise<AuthState> {
    try {
        // Check if Chrome Identity API is available
        if (typeof chrome === 'undefined' || !chrome.identity) {
            throw new AuthError(
                'Chrome Identity API not available',
                'CHROME_IDENTITY_UNAVAILABLE'
            )
        }

        // Step 1: Get authorization code via Chrome Identity API
        const { clientId } = getGitHubConfig()
        const redirectUri = getRedirectURI()
        const authUrl =
            `https://github.com/login/oauth/authorize?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${GITHUB_SCOPES.join(' ')}&` +
            `state=${generateRandomState()}`

        const redirectUrl = await new Promise<string>((resolve, reject) => {
            chrome.identity.launchWebAuthFlow(
                {
                    url: authUrl,
                    interactive: true,
                },
                (responseUrl) => {
                    if (chrome.runtime.lastError) {
                        reject(
                            new AuthError(
                                'OAuth flow failed',
                                'OAUTH_FLOW_ERROR'
                            )
                        )
                        return
                    }
                    if (!responseUrl) {
                        reject(
                            new AuthError(
                                'No response URL received',
                                'NO_RESPONSE_URL'
                            )
                        )
                        return
                    }
                    resolve(responseUrl)
                }
            )
        })

        // Step 2: Extract authorization code from redirect URL
        const url = new URL(redirectUrl)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')

        if (error) {
            throw new AuthError(
                `GitHub OAuth error: ${error}`,
                'GITHUB_OAUTH_ERROR'
            )
        }

        if (!code) {
            throw new AuthError(
                'No authorization code received',
                'NO_AUTH_CODE'
            )
        }

        // Step 3: Exchange code for access token
        const token = await exchangeCodeForToken(code)

        // Step 4: Get user information
        const user = await fetchGitHubUser(token.access_token)

        // Step 5: Create and store auth state
        const authState: AuthState = {
            isAuthenticated: true,
            token,
            user: {
                login: user.login,
                id: user.id,
                avatar_url: user.avatar_url,
                name: user.name,
                email: user.email,
            },
            lastValidated: new Date().toISOString(),
        }

        // Validate and store auth state
        const validatedAuthState = validateData(
            AuthStateSchema,
            authState,
            'authentication state'
        )

        await storage.set('authState', validatedAuthState)

        return validatedAuthState
    } catch (error) {
        console.error('Authentication failed:', error)
        if (error instanceof AuthError) {
            throw error
        }
        throw new AuthError('Authentication failed', 'UNKNOWN_ERROR')
    }
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code: string): Promise<GitHubToken> {
    const { clientId, clientSecret } = getGitHubConfig()

    const response = await fetch(
        'https://github.com/login/oauth/access_token',
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }),
        }
    )

    if (!response.ok) {
        throw new AuthError(
            'Failed to exchange code for token',
            'TOKEN_EXCHANGE_ERROR',
            response.status
        )
    }

    const data = await response.json()

    if (data.error) {
        throw new AuthError(
            `Token exchange error: ${data.error_description || data.error}`,
            'TOKEN_EXCHANGE_ERROR'
        )
    }

    // Create token object with current timestamp
    const tokenData = {
        access_token: data.access_token,
        token_type: data.token_type || 'bearer',
        scope: data.scope || GITHUB_SCOPES.join(' '),
        created_at: new Date().toISOString(),
        // GitHub tokens don't expire by default, but we can set a validation period
        expires_at: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : undefined,
    }

    return validateData(GitHubTokenSchema, tokenData, 'GitHub token')
}

// Fetch GitHub user information with enhanced error handling
async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'GitHub-Navigator-Extension',
        },
    })

    // Update rate limit state
    updateRateLimitState(response)

    if (!response.ok) {
        let errorMessage = 'Failed to fetch user information'

        if (response.status === 401) {
            errorMessage = 'Invalid or expired access token'
        } else if (response.status === 403) {
            const remaining = response.headers.get('X-RateLimit-Remaining')
            if (remaining === '0') {
                errorMessage = 'Rate limit exceeded. Please try again later.'
            } else {
                errorMessage =
                    'Access forbidden. Token may have insufficient permissions.'
            }
        } else if (response.status >= 500) {
            errorMessage = 'GitHub API server error. Please try again later.'
        }

        throw new AuthError(errorMessage, 'USER_FETCH_ERROR', response.status)
    }

    const userData = await response.json()
    return validateData(GitHubUserSchema, userData, 'GitHub user data')
}

// Get current authentication state
export async function getAuthState(): Promise<AuthState | null> {
    try {
        const storedAuthState = await storage.get('authState')

        if (!storedAuthState) {
            return null
        }

        const validationResult = safeValidateData(
            AuthStateSchema,
            storedAuthState
        )

        if (validationResult.success) {
            return validationResult.data
        } else {
            console.warn('Invalid stored auth state, clearing')
            await clearAuthState()
            return null
        }
    } catch (error) {
        console.error('Failed to get auth state:', error)
        return null
    }
}

// Rate limit state tracking
interface RateLimitState {
    resetTime: number
    remaining: number
    limit: number
}

let rateLimitState: RateLimitState | null = null

// Validate token with GitHub API with enhanced error handling
export async function validateToken(
    token: string,
    maxRetries: number = 3
): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Check rate limit before making request
            if (rateLimitState && rateLimitState.remaining <= 0) {
                const now = Date.now()
                if (now < rateLimitState.resetTime) {
                    console.warn(
                        `Rate limit exceeded. Reset at: ${new Date(
                            rateLimitState.resetTime
                        ).toISOString()}`
                    )
                    return false
                }
                // Reset rate limit state if time has passed
                rateLimitState = null
            }

            const response = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'User-Agent': 'GitHub-Navigator-Extension',
                },
            })

            // Update rate limit state from response headers
            updateRateLimitState(response)

            if (response.ok) {
                return true
            }

            // Handle specific error cases
            if (response.status === 401) {
                // Token is invalid, clear auth state
                console.warn('Token is invalid (401), clearing auth state')
                await clearAuthState()
                return false
            }

            if (response.status === 403) {
                // Check if it's a rate limit error
                const remaining = response.headers.get('X-RateLimit-Remaining')
                if (remaining === '0') {
                    console.warn('Rate limit exceeded (403)')
                    return false
                }
                // Other 403 errors (like suspended account)
                console.warn('Access forbidden (403), token may be restricted')
                return false
            }

            if (response.status >= 500 && attempt < maxRetries) {
                // Server error, retry with exponential backoff
                const delay = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s...
                console.warn(
                    `Server error (${response.status}), retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`
                )
                await new Promise((resolve) => setTimeout(resolve, delay))
                continue
            }

            console.warn(
                `Token validation failed with status: ${response.status}`
            )
            return false
        } catch (error) {
            // Network or other errors
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 1000
                console.warn(
                    `Network error during token validation, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`
                )
                console.error(error)
                await new Promise((resolve) => setTimeout(resolve, delay))
                continue
            }

            console.error('Token validation failed after all retries:', error)
            return false
        }
    }

    return false
}

// Update rate limit state from response headers
function updateRateLimitState(response: Response): void {
    try {
        const limit = response.headers.get('X-RateLimit-Limit')
        const remaining = response.headers.get('X-RateLimit-Remaining')
        const reset = response.headers.get('X-RateLimit-Reset')

        if (limit && remaining && reset) {
            rateLimitState = {
                limit: parseInt(limit, 10),
                remaining: parseInt(remaining, 10),
                resetTime: parseInt(reset, 10) * 1000, // Convert to milliseconds
            }
        }
    } catch (error) {
        console.warn('Failed to parse rate limit headers:', error)
    }
}

// Check if current token is valid and not expired
export async function isTokenValid(): Promise<boolean> {
    const authState = await getAuthState()

    if (!authState || !authState.isAuthenticated || !authState.token) {
        return false
    }

    // Check if token is expired (if expires_at is set)
    if (authState.token.expires_at) {
        const expiresAt = new Date(authState.token.expires_at)
        if (expiresAt <= new Date()) {
            return false
        }
    }

    // Check if we need to validate with GitHub (every 24 hours)
    if (authState.lastValidated) {
        const lastValidated = new Date(authState.lastValidated)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        if (lastValidated > twentyFourHoursAgo) {
            return true // Recently validated, assume still valid
        }
    }

    // Validate with GitHub API
    const isValid = await validateToken(authState.token.access_token)

    if (isValid) {
        // Update last validated timestamp
        const updatedAuthState = {
            ...authState,
            lastValidated: new Date().toISOString(),
        }
        await storage.set('authState', updatedAuthState)
    } else {
        // Token is invalid, clear auth state
        await clearAuthState()
    }

    return isValid
}

// Clear authentication state
export async function clearAuthState(): Promise<void> {
    try {
        await storage.remove('authState')
    } catch (error) {
        console.error('Failed to clear auth state:', error)
    }
}

// Sign out user
export async function signOut(): Promise<void> {
    await clearAuthState()
}

// Check if token expires within specified days
export async function isTokenExpiringWithin(days: number): Promise<boolean> {
    const authState = await getAuthState()

    if (!authState || !authState.token || !authState.token.expires_at) {
        return false
    }

    const expiresAt = new Date(authState.token.expires_at)
    const warningDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    return expiresAt <= warningDate
}

// Generate random state for OAuth flow
function generateRandomState(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
        ''
    )
}

// Get access token for API requests
export async function getAccessToken(): Promise<string | null> {
    const authState = await getAuthState()
    return authState?.token?.access_token || null
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
    const authState = await getAuthState()
    return authState?.isAuthenticated === true && (await isTokenValid())
}
