import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Chrome APIs globally
global.chrome = {
    identity: {
        getRedirectURL: vi.fn(() => 'https://test.extension/oauth/callback'),
        launchWebAuthFlow: vi.fn(),
    },
    runtime: {
        lastError: null,
    },
} as unknown as typeof chrome

// Mock crypto for random state generation
Object.defineProperty(global, 'crypto', {
    value: {
        getRandomValues: vi.fn((arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256)
            }
            return arr
        }),
    },
})

// Mock fetch
global.fetch = vi.fn()

// Mock process.env
process.env.PLASMO_PUBLIC_GITHUB_CLIENT_ID = 'test_client_id'
process.env.PLASMO_PUBLIC_GITHUB_CLIENT_SECRET = 'test_client_secret'
