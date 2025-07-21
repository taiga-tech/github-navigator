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

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.PLASMO_PUBLIC_GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.PLASMO_PUBLIC_GITHUB_CLIENT_SECRET
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
        const redirectUri = getRedirectURI()
        const authUrl =
            `https://github.com/login/oauth/authorize?` +
            `client_id=${GITHUB_CLIENT_ID}&` +
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
    const response = await fetch(
        'https://github.com/login/oauth/access_token',
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
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

// Fetch GitHub user information
async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Navigator-Extension',
        },
    })

    if (!response.ok) {
        throw new AuthError(
            'Failed to fetch user information',
            'USER_FETCH_ERROR',
            response.status
        )
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

// Validate token with GitHub API
export async function validateToken(token: string): Promise<boolean> {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Navigator-Extension',
            },
        })

        return response.ok
    } catch (error) {
        console.error('Token validation failed:', error)
        return false
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
