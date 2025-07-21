import * as z from 'zod'

// Basic Repository Schema for initial setup
export const RepositoryOwnerSchema = z.object({
    login: z.string(),
    avatar_url: z.url(),
})

export const RepositorySchema = z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    owner: RepositoryOwnerSchema,
    description: z.string().nullable().optional(),
    private: z.boolean(),
    html_url: z.url(),
    clone_url: z.url(),
    ssh_url: z.string(),
    default_branch: z.string(),
    language: z.string().nullable().optional(),
    stargazers_count: z.number(),
    forks_count: z.number(),
    open_issues_count: z.number(),
    updated_at: z.iso.datetime(),
    // Extension metadata
    is_favorite: z.boolean().default(false),
    last_accessed: z.iso.datetime(),
})

// Basic validation function
export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
): T {
    try {
        return schema.parse(data)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = `Validation failed${context ? ` for ${context}` : ''}: ${error.issues
                .map((e) => `${e.path.join('.')}: ${e.message}`)
                .join(', ')}`
            throw new Error(errorMessage)
        }
        throw error
    }
}

// Safe validation function that returns result object
export function safeValidateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(data)
    return result
}

// Authentication Schemas
export const GitHubTokenSchema = z.object({
    access_token: z.string().min(1),
    token_type: z.literal('bearer').default('bearer'),
    scope: z.string(),
    created_at: z.iso.datetime(),
    expires_at: z.iso.datetime().optional(),
})

export const AuthStateSchema = z.object({
    isAuthenticated: z.boolean(),
    token: GitHubTokenSchema.optional(),
    user: z
        .object({
            login: z.string(),
            id: z.number(),
            avatar_url: z.url(),
            name: z.string().nullable(),
            email: z.email().nullable(),
        })
        .optional(),
    lastValidated: z.iso.datetime().optional(),
})

export const GitHubUserSchema = z.object({
    login: z.string(),
    id: z.number(),
    node_id: z.string(),
    avatar_url: z.url(),
    gravatar_id: z.string().nullable(),
    url: z.url(),
    html_url: z.url(),
    followers_url: z.url(),
    following_url: z.url(),
    gists_url: z.url(),
    starred_url: z.url(),
    subscriptions_url: z.url(),
    organizations_url: z.url(),
    repos_url: z.url(),
    events_url: z.url(),
    received_events_url: z.url(),
    type: z.string(),
    site_admin: z.boolean(),
    name: z.string().nullable(),
    company: z.string().nullable(),
    blog: z.string().nullable(),
    location: z.string().nullable(),
    email: z.email().nullable(),
    hireable: z.boolean().nullable(),
    bio: z.string().nullable(),
    twitter_username: z.string().nullable(),
    public_repos: z.number(),
    public_gists: z.number(),
    followers: z.number(),
    following: z.number(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
})

// Type inference from Zod schemas
export type Repository = z.infer<typeof RepositorySchema>
export type RepositoryOwner = z.infer<typeof RepositoryOwnerSchema>
export type GitHubToken = z.infer<typeof GitHubTokenSchema>
export type AuthState = z.infer<typeof AuthStateSchema>
export type GitHubUser = z.infer<typeof GitHubUserSchema>
