import { describe, expect, it } from 'vitest'

import { AuthError } from '@/lib/auth'
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
})
