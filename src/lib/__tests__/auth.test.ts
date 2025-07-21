import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthError, validateToken } from '@/lib/auth'
import {
    AuthStateSchema,
    GitHubTokenSchema,
    GitHubUserSchema,
} from '@/lib/schemas'

describe('Authentication System', () => {
    describe('AuthError', () => {
        it('should create an AuthError with correct properties', () => {
            const error = new AuthError('Test error', 'TEST_CODE', 401)

            expect(error.name).toBe('AuthError')
            expect(error.message).toBe('Test error')
            expect(error.code).toBe('TEST_CODE')
            expect(error.status).toBe(401)
        })

        it('should create an AuthError without status', () => {
            const error = new AuthError('Test error', 'TEST_CODE')

            expect(error.name).toBe('AuthError')
            expect(error.message).toBe('Test error')
            expect(error.code).toBe('TEST_CODE')
            expect(error.status).toBeUndefined()
        })
    })

    describe('Schema validation', () => {
        describe('AuthStateSchema', () => {
            it('should validate correct auth state schema', () => {
                const validAuthState = {
                    isAuthenticated: true,
                    token: {
                        access_token: 'test_token',
                        token_type: 'bearer' as const,
                        scope: 'repo notifications',
                        created_at: new Date().toISOString(),
                    },
                    user: {
                        login: 'testuser',
                        id: 123,
                        avatar_url: 'https://github.com/avatar.jpg',
                        name: 'Test User',
                        email: 'test@example.com',
                    },
                    lastValidated: new Date().toISOString(),
                }

                expect(() =>
                    AuthStateSchema.parse(validAuthState)
                ).not.toThrow()
            })

            it('should reject invalid auth state schema', () => {
                const invalidAuthState = {
                    isAuthenticated: 'not_boolean',
                    token: {
                        access_token: '', // Empty string should fail min(1)
                    },
                }

                expect(() => AuthStateSchema.parse(invalidAuthState)).toThrow()
            })

            it('should allow minimal auth state', () => {
                const minimalAuthState = {
                    isAuthenticated: false,
                }

                expect(() =>
                    AuthStateSchema.parse(minimalAuthState)
                ).not.toThrow()
            })
        })

        describe('GitHubTokenSchema', () => {
            it('should validate token with required fields', () => {
                const validToken = {
                    access_token: 'ghp_test_token_123',
                    token_type: 'bearer' as const,
                    scope: 'repo notifications user:email',
                    created_at: new Date().toISOString(),
                }

                expect(() => GitHubTokenSchema.parse(validToken)).not.toThrow()
            })

            it('should reject token with invalid access_token', () => {
                const invalidToken = {
                    access_token: '', // Empty string
                    token_type: 'bearer' as const,
                    scope: 'repo',
                    created_at: new Date().toISOString(),
                }

                expect(() => GitHubTokenSchema.parse(invalidToken)).toThrow()
            })

            it('should default token_type to bearer', () => {
                const tokenWithoutType = {
                    access_token: 'test_token',
                    scope: 'repo',
                    created_at: new Date().toISOString(),
                }

                const result = GitHubTokenSchema.parse(tokenWithoutType)
                expect(result.token_type).toBe('bearer')
            })

            it('should allow optional expires_at', () => {
                const tokenWithExpiry = {
                    access_token: 'test_token',
                    token_type: 'bearer' as const,
                    scope: 'repo',
                    created_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 3600000).toISOString(),
                }

                expect(() =>
                    GitHubTokenSchema.parse(tokenWithExpiry)
                ).not.toThrow()
            })
        })

        describe('GitHubUserSchema', () => {
            it('should validate complete user data', () => {
                const validUser = {
                    login: 'testuser',
                    id: 123,
                    node_id: 'MDQ6VXNlcjEyMw==',
                    avatar_url: 'https://github.com/avatar.jpg',
                    gravatar_id: null,
                    url: 'https://api.github.com/users/testuser',
                    html_url: 'https://github.com/testuser',
                    followers_url:
                        'https://api.github.com/users/testuser/followers',
                    following_url:
                        'https://api.github.com/users/testuser/following{/other_user}',
                    gists_url:
                        'https://api.github.com/users/testuser/gists{/gist_id}',
                    starred_url:
                        'https://api.github.com/users/testuser/starred{/owner}{/repo}',
                    subscriptions_url:
                        'https://api.github.com/users/testuser/subscriptions',
                    organizations_url:
                        'https://api.github.com/users/testuser/orgs',
                    repos_url: 'https://api.github.com/users/testuser/repos',
                    events_url:
                        'https://api.github.com/users/testuser/events{/privacy}',
                    received_events_url:
                        'https://api.github.com/users/testuser/received_events',
                    type: 'User',
                    site_admin: false,
                    name: 'Test User',
                    company: null,
                    blog: null,
                    location: null,
                    email: 'test@example.com',
                    hireable: null,
                    bio: null,
                    twitter_username: null,
                    public_repos: 10,
                    public_gists: 5,
                    followers: 100,
                    following: 50,
                    created_at: '2020-01-01T00:00:00Z',
                    updated_at: '2023-01-01T00:00:00Z',
                }

                expect(() => GitHubUserSchema.parse(validUser)).not.toThrow()
            })

            it('should allow null values for optional fields', () => {
                const userWithNulls = {
                    login: 'testuser',
                    id: 123,
                    node_id: 'MDQ6VXNlcjEyMw==',
                    avatar_url: 'https://github.com/avatar.jpg',
                    gravatar_id: null,
                    url: 'https://api.github.com/users/testuser',
                    html_url: 'https://github.com/testuser',
                    followers_url:
                        'https://api.github.com/users/testuser/followers',
                    following_url:
                        'https://api.github.com/users/testuser/following{/other_user}',
                    gists_url:
                        'https://api.github.com/users/testuser/gists{/gist_id}',
                    starred_url:
                        'https://api.github.com/users/testuser/starred{/owner}{/repo}',
                    subscriptions_url:
                        'https://api.github.com/users/testuser/subscriptions',
                    organizations_url:
                        'https://api.github.com/users/testuser/orgs',
                    repos_url: 'https://api.github.com/users/testuser/repos',
                    events_url:
                        'https://api.github.com/users/testuser/events{/privacy}',
                    received_events_url:
                        'https://api.github.com/users/testuser/received_events',
                    type: 'User',
                    site_admin: false,
                    name: null,
                    company: null,
                    blog: null,
                    location: null,
                    email: null,
                    hireable: null,
                    bio: null,
                    twitter_username: null,
                    public_repos: 0,
                    public_gists: 0,
                    followers: 0,
                    following: 0,
                    created_at: '2020-01-01T00:00:00Z',
                    updated_at: '2023-01-01T00:00:00Z',
                }

                expect(() =>
                    GitHubUserSchema.parse(userWithNulls)
                ).not.toThrow()
            })

            it('should reject user with invalid email', () => {
                const invalidUser = {
                    login: 'testuser',
                    id: 123,
                    node_id: 'MDQ6VXNlcjEyMw==',
                    avatar_url: 'https://github.com/avatar.jpg',
                    gravatar_id: null,
                    url: 'https://api.github.com/users/testuser',
                    html_url: 'https://github.com/testuser',
                    followers_url:
                        'https://api.github.com/users/testuser/followers',
                    following_url:
                        'https://api.github.com/users/testuser/following{/other_user}',
                    gists_url:
                        'https://api.github.com/users/testuser/gists{/gist_id}',
                    starred_url:
                        'https://api.github.com/users/testuser/starred{/owner}{/repo}',
                    subscriptions_url:
                        'https://api.github.com/users/testuser/subscriptions',
                    organizations_url:
                        'https://api.github.com/users/testuser/orgs',
                    repos_url: 'https://api.github.com/users/testuser/repos',
                    events_url:
                        'https://api.github.com/users/testuser/events{/privacy}',
                    received_events_url:
                        'https://api.github.com/users/testuser/received_events',
                    type: 'User',
                    site_admin: false,
                    name: 'Test User',
                    company: null,
                    blog: null,
                    location: null,
                    email: 'not-an-email',
                    hireable: null,
                    bio: null,
                    twitter_username: null,
                    public_repos: 0,
                    public_gists: 0,
                    followers: 0,
                    following: 0,
                    created_at: '2020-01-01T00:00:00Z',
                    updated_at: '2023-01-01T00:00:00Z',
                }

                expect(() => GitHubUserSchema.parse(invalidUser)).toThrow()
            })
        })
    })

    describe('Enhanced Authentication Functions', () => {
        beforeEach(() => {
            // Reset mocks before each test
            vi.resetAllMocks()
        })

        afterEach(() => {
            // Clean up any lingering state
            vi.clearAllMocks()
        })

        describe('validateToken function', () => {
            it('should successfully validate a valid token', async () => {
                // Mock successful API response
                global.fetch = vi.fn().mockResolvedValue({
                    ok: true,
                    headers: {
                        get: vi.fn().mockImplementation((header) => {
                            switch (header) {
                                case 'X-RateLimit-Limit':
                                    return '5000'
                                case 'X-RateLimit-Remaining':
                                    return '4999'
                                case 'X-RateLimit-Reset':
                                    return String(
                                        Math.floor(Date.now() / 1000) + 3600
                                    )
                                default:
                                    return null
                            }
                        }),
                    },
                })

                const result = await validateToken('valid_token')
                expect(result).toBe(true)
                expect(global.fetch).toHaveBeenCalledWith(
                    'https://api.github.com/user',
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            Authorization: 'Bearer valid_token',
                            'X-GitHub-Api-Version': '2022-11-28',
                        }),
                    })
                )
            })

            it('should handle invalid token (401)', async () => {
                global.fetch = vi.fn().mockResolvedValue({
                    ok: false,
                    status: 401,
                    headers: {
                        get: vi.fn().mockReturnValue(null),
                    },
                })

                const result = await validateToken('invalid_token')
                expect(result).toBe(false)
            })

            it('should handle rate limit exceeded (403)', async () => {
                global.fetch = vi.fn().mockResolvedValue({
                    ok: false,
                    status: 403,
                    headers: {
                        get: vi.fn().mockImplementation((header) => {
                            if (header === 'X-RateLimit-Remaining') return '0'
                            return null
                        }),
                    },
                })

                const result = await validateToken('rate_limited_token')
                expect(result).toBe(false)
            })

            it('should retry on server errors (500)', async () => {
                // First two calls fail with 500, third succeeds
                global.fetch = vi
                    .fn()
                    .mockResolvedValueOnce({
                        ok: false,
                        status: 500,
                        headers: { get: vi.fn().mockReturnValue(null) },
                    })
                    .mockResolvedValueOnce({
                        ok: false,
                        status: 500,
                        headers: { get: vi.fn().mockReturnValue(null) },
                    })
                    .mockResolvedValueOnce({
                        ok: true,
                        headers: {
                            get: vi.fn().mockImplementation((header) => {
                                switch (header) {
                                    case 'X-RateLimit-Limit':
                                        return '5000'
                                    case 'X-RateLimit-Remaining':
                                        return '4998'
                                    case 'X-RateLimit-Reset':
                                        return String(
                                            Math.floor(Date.now() / 1000) + 3600
                                        )
                                    default:
                                        return null
                                }
                            }),
                        },
                    })

                const result = await validateToken('retry_token')
                expect(result).toBe(true)
                expect(global.fetch).toHaveBeenCalledTimes(3)
            })

            it('should handle network errors with retry', async () => {
                // First call throws network error, second succeeds
                global.fetch = vi
                    .fn()
                    .mockRejectedValueOnce(new Error('Network error'))
                    .mockResolvedValueOnce({
                        ok: true,
                        headers: {
                            get: vi.fn().mockImplementation((header) => {
                                switch (header) {
                                    case 'X-RateLimit-Limit':
                                        return '5000'
                                    case 'X-RateLimit-Remaining':
                                        return '4997'
                                    case 'X-RateLimit-Reset':
                                        return String(
                                            Math.floor(Date.now() / 1000) + 3600
                                        )
                                    default:
                                        return null
                                }
                            }),
                        },
                    })

                const result = await validateToken('network_error_token')
                expect(result).toBe(true)
                expect(global.fetch).toHaveBeenCalledTimes(2)
            })

            it('should fail after max retries on persistent network errors', async () => {
                global.fetch = vi
                    .fn()
                    .mockRejectedValue(new Error('Persistent network error'))

                const result = await validateToken('persistent_error_token', 2) // maxRetries = 2
                expect(result).toBe(false)
                expect(global.fetch).toHaveBeenCalledTimes(2)
            })

            it('should handle malformed rate limit headers gracefully', async () => {
                global.fetch = vi.fn().mockResolvedValue({
                    ok: true,
                    headers: {
                        get: vi.fn().mockImplementation((header) => {
                            switch (header) {
                                case 'X-RateLimit-Limit':
                                    return 'invalid_number'
                                case 'X-RateLimit-Remaining':
                                    return 'also_invalid'
                                case 'X-RateLimit-Reset':
                                    return 'not_a_timestamp'
                                default:
                                    return null
                            }
                        }),
                    },
                })

                const result = await validateToken('malformed_headers_token')
                expect(result).toBe(true) // Should still succeed despite malformed headers
            })
        })

        describe('Token expiration handling', () => {
            it('should detect expired tokens by checking expires_at', () => {
                // Test token expiration logic directly
                const expiredToken = {
                    access_token: 'expired_token',
                    token_type: 'bearer' as const,
                    scope: 'repo',
                    created_at: new Date(
                        Date.now() - 2 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                    expires_at: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
                }

                const now = new Date()
                const expiresAt = new Date(expiredToken.expires_at)
                const isExpired = expiresAt <= now

                expect(isExpired).toBe(true)
            })

            it('should detect valid tokens by checking expires_at', () => {
                // Test non-expired token
                const validToken = {
                    access_token: 'valid_token',
                    token_type: 'bearer' as const,
                    scope: 'repo',
                    created_at: new Date().toISOString(),
                    expires_at: new Date(
                        Date.now() + 60 * 60 * 1000
                    ).toISOString(), // Expires in 1 hour
                }

                const now = new Date()
                const expiresAt = new Date(validToken.expires_at)
                const isExpired = expiresAt <= now

                expect(isExpired).toBe(false)
            })

            it('should handle tokens without expires_at', () => {
                // Test token without expiration (Personal Access Tokens typically don't expire)
                const tokenWithoutExpiry = {
                    access_token: 'pat_token',
                    token_type: 'bearer' as const,
                    scope: 'repo',
                    created_at: new Date().toISOString(),
                    // No expires_at
                }

                // Should not be considered expired if no expires_at is set
                const hasExpiration =
                    'expires_at' in tokenWithoutExpiry &&
                    tokenWithoutExpiry.expires_at
                expect(hasExpiration).toBe(false)
            })
        })

        describe('Rate limit handling', () => {
            it('should handle rate limit headers correctly', async () => {
                // Mock response with rate limit headers
                global.fetch = vi.fn().mockResolvedValue({
                    ok: true,
                    headers: {
                        get: vi.fn().mockImplementation((header) => {
                            switch (header) {
                                case 'X-RateLimit-Remaining':
                                    return '100'
                                case 'X-RateLimit-Limit':
                                    return '5000'
                                case 'X-RateLimit-Reset':
                                    return String(
                                        Math.floor(Date.now() / 1000) + 3600
                                    )
                                default:
                                    return null
                            }
                        }),
                    },
                })

                const result = await validateToken('rate_limit_test_token')
                expect(result).toBe(true)
                expect(global.fetch).toHaveBeenCalledWith(
                    'https://api.github.com/user',
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            'X-GitHub-Api-Version': '2022-11-28',
                        }),
                    })
                )
            })

            it('should detect rate limit exceeded status', async () => {
                // Mock rate limit exceeded response
                global.fetch = vi.fn().mockResolvedValue({
                    ok: false,
                    status: 403,
                    headers: {
                        get: vi.fn().mockImplementation((header) => {
                            if (header === 'X-RateLimit-Remaining') return '0'
                            return null
                        }),
                    },
                })

                const result = await validateToken('rate_limited_token')
                expect(result).toBe(false)
            })
        })
    })
})
