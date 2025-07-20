// Test file to verify Zod integration
import { RepositorySchema, validateData } from './schemas'

// Test data
const testRepository = {
    id: 123,
    name: 'test-repo',
    full_name: 'user/test-repo',
    owner: {
        login: 'user',
        avatar_url: 'https://github.com/avatar.jpg',
    },
    description: 'A test repository',
    private: false,
    html_url: 'https://github.com/user/test-repo',
    clone_url: 'https://github.com/user/test-repo.git',
    ssh_url: 'git@github.com:user/test-repo.git',
    default_branch: 'main',
    language: 'TypeScript',
    stargazers_count: 10,
    forks_count: 5,
    open_issues_count: 2,
    updated_at: '2023-01-01T00:00:00Z',
    is_favorite: false,
    last_accessed: '2023-01-01T00:00:00Z',
}

// Test validation
export function testZodIntegration() {
    try {
        const validatedRepo = validateData(
            RepositorySchema,
            testRepository,
            'test repository'
        )
        console.log('✅ Zod validation successful:', validatedRepo.name)
        return true
    } catch (error) {
        console.error('❌ Zod validation failed:', error)
        return false
    }
}
