import { getAccessToken } from '@/lib/auth'

// GitHub AP URL
const GITHUB_API_BASE = 'https://api.github.com'

// GitHub API error class
export class GitHubAPIError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: Record<string, unknown>
    ) {
        super(message)
        this.name = 'GitHubAPIError'
    }
}

// Generic GitHub API request function
async function githubRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAccessToken()

    if (!token) {
        throw new GitHubAPIError('No access token available', 401)
    }

    const url = endpoint.startsWith('http')
        ? endpoint
        : `${GITHUB_API_BASE}${endpoint}`

    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Navigator-Extension',
            ...options.headers,
        },
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new GitHubAPIError(
            errorData.message ||
                `GitHub API request failed: ${response.status}`,
            response.status,
            errorData
        )
    }

    return response.json()
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
