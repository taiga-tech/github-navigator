import { z } from 'zod'

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

// Type inference from Zod schemas
export type Repository = z.infer<typeof RepositorySchema>
export type RepositoryOwner = z.infer<typeof RepositoryOwnerSchema>
