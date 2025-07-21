import { getAccessToken } from '@/lib/auth'

// GitHub AP URL
const GITHUB_API_BASE = 'https://api.github.com'

// GitHub API error class
export class GitHubAPIError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: Record<string, unknown>,
        public isRetryable: boolean = false
    ) {
        super(message)
        this.name = 'GitHubAPIError'
    }
}

// Rate limit state tracking
interface RateLimitState {
    resetTime: number
    remaining: number
    limit: number
}

let rateLimitState: RateLimitState | null = null

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

// Check if we're approaching rate limit
function isApproachingRateLimit(): boolean {
    if (!rateLimitState) return false

    // Consider approaching limit when less than 10% remaining
    const threshold = Math.max(1, Math.floor(rateLimitState.limit * 0.1))
    return rateLimitState.remaining <= threshold
}

// Wait for rate limit reset if needed
async function waitForRateLimitReset(): Promise<void> {
    if (!rateLimitState || rateLimitState.remaining > 0) {
        return
    }

    const now = Date.now()
    if (now < rateLimitState.resetTime) {
        const waitTime = rateLimitState.resetTime - now
        console.warn(
            `Rate limit exceeded. Waiting ${waitTime}ms until reset...`
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        rateLimitState = null // Reset state after waiting
    }
}

// Generic GitHub API request function with enhanced error handling and retry logic
async function githubRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3
): Promise<T> {
    const token = await getAccessToken()

    if (!token) {
        throw new GitHubAPIError('No access token available', 401)
    }

    // Check rate limit before making request
    await waitForRateLimitReset()

    const url = endpoint.startsWith('http')
        ? endpoint
        : `${GITHUB_API_BASE}${endpoint}`

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Warn if approaching rate limit
            if (isApproachingRateLimit()) {
                console.warn('Approaching GitHub API rate limit')
            }

            const response = await fetch(url, {
                ...options,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'User-Agent': 'GitHub-Navigator-Extension',
                    ...options.headers,
                },
            })

            // Update rate limit state from response
            updateRateLimitState(response)

            if (response.ok) {
                return await response.json()
            }

            // Handle specific error cases
            const errorData = await response.json().catch(() => ({}))
            let errorMessage =
                errorData.message ||
                `GitHub API request failed: ${response.status}`
            let isRetryable = false

            if (response.status === 401) {
                errorMessage = 'Invalid or expired access token'
                isRetryable = false
            } else if (response.status === 403) {
                const remaining = response.headers.get('X-RateLimit-Remaining')
                if (remaining === '0') {
                    errorMessage =
                        'Rate limit exceeded. Please try again later.'
                    isRetryable = true
                    // Wait for rate limit reset before retrying
                    await waitForRateLimitReset()
                } else {
                    errorMessage =
                        'Access forbidden. Token may have insufficient permissions.'
                    isRetryable = false
                }
            } else if (response.status === 404) {
                errorMessage = 'Resource not found'
                isRetryable = false
            } else if (response.status >= 500) {
                errorMessage =
                    'GitHub API server error. Please try again later.'
                isRetryable = true
            } else if (response.status === 422) {
                errorMessage = 'Validation failed'
                isRetryable = false
            }

            // Retry for retryable errors
            if (isRetryable && attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 1000 // Exponential backoff: 1s, 2s, 4s
                console.warn(
                    `GitHub API request failed (${response.status}), retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`
                )
                await new Promise((resolve) => setTimeout(resolve, delay))
                continue
            }

            throw new GitHubAPIError(
                errorMessage,
                response.status,
                errorData,
                isRetryable
            )
        } catch (error) {
            // Network or other errors
            if (error instanceof GitHubAPIError) {
                throw error
            }

            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 1000
                console.warn(
                    `Network error during GitHub API request, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`
                )
                console.error(error)
                await new Promise((resolve) => setTimeout(resolve, delay))
                continue
            }

            throw new GitHubAPIError(
                `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                0,
                undefined,
                true
            )
        }
    }

    // This should never be reached, but TypeScript requires it
    throw new GitHubAPIError('Maximum retries exceeded', 0, undefined, false)
}

// Test the GitHub API connection
export async function testGitHubConnection(): Promise<boolean> {
    try {
        await githubRequest('/user')
        return true
    } catch (error) {
        console.error('GitHub connection test failed:', error)
        return false
    }
}

// Get current user information
export async function getCurrentUser() {
    return githubRequest('/user')
}

// Get user repositories
export async function getUserRepositories(
    options: {
        type?: 'all' | 'owner' | 'public' | 'private' | 'member'
        sort?: 'created' | 'updated' | 'pushed' | 'full_name'
        direction?: 'asc' | 'desc'
        per_page?: number
        page?: number
    } = {}
) {
    const params = new URLSearchParams()

    if (options.type) params.append('type', options.type)
    if (options.sort) params.append('sort', options.sort)
    if (options.direction) params.append('direction', options.direction)
    if (options.per_page) params.append('per_page', options.per_page.toString())
    if (options.page) params.append('page', options.page.toString())

    const queryString = params.toString()
    const endpoint = `/user/repos${queryString ? `?${queryString}` : ''}`

    return githubRequest(endpoint)
}

// Get notifications
export async function getNotifications(
    options: {
        all?: boolean
        participating?: boolean
        since?: string
        before?: string
        per_page?: number
        page?: number
    } = {}
) {
    const params = new URLSearchParams()

    if (options.all !== undefined) params.append('all', options.all.toString())
    if (options.participating !== undefined)
        params.append('participating', options.participating.toString())
    if (options.since) params.append('since', options.since)
    if (options.before) params.append('before', options.before)
    if (options.per_page) params.append('per_page', options.per_page.toString())
    if (options.page) params.append('page', options.page.toString())

    const queryString = params.toString()
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`

    return githubRequest(endpoint)
}

// Mark notification as read
export async function markNotificationAsRead(
    notificationId: string
): Promise<void> {
    await githubRequest(`/notifications/threads/${notificationId}`, {
        method: 'PATCH',
    })
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
    await githubRequest('/notifications', {
        method: 'PUT',
    })
}

// Get repository issues
export async function getRepositoryIssues(
    owner: string,
    repo: string,
    options: {
        state?: 'open' | 'closed' | 'all'
        labels?: string
        sort?: 'created' | 'updated' | 'comments'
        direction?: 'asc' | 'desc'
        since?: string
        per_page?: number
        page?: number
    } = {}
) {
    const params = new URLSearchParams()

    if (options.state) params.append('state', options.state)
    if (options.labels) params.append('labels', options.labels)
    if (options.sort) params.append('sort', options.sort)
    if (options.direction) params.append('direction', options.direction)
    if (options.since) params.append('since', options.since)
    if (options.per_page) params.append('per_page', options.per_page.toString())
    if (options.page) params.append('page', options.page.toString())

    const queryString = params.toString()
    const endpoint = `/repos/${owner}/${repo}/issues${queryString ? `?${queryString}` : ''}`

    return githubRequest(endpoint)
}

// Get repository pull requests
export async function getRepositoryPullRequests(
    owner: string,
    repo: string,
    options: {
        state?: 'open' | 'closed' | 'all'
        head?: string
        base?: string
        sort?: 'created' | 'updated' | 'popularity' | 'long-running'
        direction?: 'asc' | 'desc'
        per_page?: number
        page?: number
    } = {}
) {
    const params = new URLSearchParams()

    if (options.state) params.append('state', options.state)
    if (options.head) params.append('head', options.head)
    if (options.base) params.append('base', options.base)
    if (options.sort) params.append('sort', options.sort)
    if (options.direction) params.append('direction', options.direction)
    if (options.per_page) params.append('per_page', options.per_page.toString())
    if (options.page) params.append('page', options.page.toString())

    const queryString = params.toString()
    const endpoint = `/repos/${owner}/${repo}/pulls${queryString ? `?${queryString}` : ''}`

    return githubRequest(endpoint)
}

// Search repositories
export async function searchRepositories(
    query: string,
    options: {
        sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated'
        order?: 'asc' | 'desc'
        per_page?: number
        page?: number
    } = {}
) {
    const params = new URLSearchParams()
    params.append('q', query)

    if (options.sort) params.append('sort', options.sort)
    if (options.order) params.append('order', options.order)
    if (options.per_page) params.append('per_page', options.per_page.toString())
    if (options.page) params.append('page', options.page.toString())

    const queryString = params.toString()
    const endpoint = `/search/repositories?${queryString}`

    return githubRequest(endpoint)
}

// Search issues and pull requests
export async function searchIssues(
    query: string,
    options: {
        sort?:
            | 'comments'
            | 'reactions'
            | 'reactions-+1'
            | 'reactions--1'
            | 'reactions-smile'
            | 'reactions-thinking_face'
            | 'reactions-heart'
            | 'reactions-tada'
            | 'interactions'
            | 'created'
            | 'updated'
        order?: 'asc' | 'desc'
        per_page?: number
        page?: number
    } = {}
) {
    const params = new URLSearchParams()
    params.append('q', query)

    if (options.sort) params.append('sort', options.sort)
    if (options.order) params.append('order', options.order)
    if (options.per_page) params.append('per_page', options.per_page.toString())
    if (options.page) params.append('page', options.page.toString())

    const queryString = params.toString()
    const endpoint = `/search/issues?${queryString}`

    return githubRequest(endpoint)
}

// Search code
export async function searchCode(
    query: string,
    options: {
        sort?: 'indexed'
        order?: 'asc' | 'desc'
        per_page?: number
        page?: number
    } = {}
) {
    const params = new URLSearchParams()
    params.append('q', query)

    if (options.sort) params.append('sort', options.sort)
    if (options.order) params.append('order', options.order)
    if (options.per_page) params.append('per_page', options.per_page.toString())
    if (options.page) params.append('page', options.page.toString())

    const queryString = params.toString()
    const endpoint = `/search/code?${queryString}`

    return githubRequest(endpoint)
}
