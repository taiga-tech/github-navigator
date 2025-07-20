# 設計文書

## 概要

GitHub Navigator Chrome拡張機能は、Plasmoフレームワークを使用して構築される、リポジトリ中心のGitHub管理ツールです。提供されたデザインイメージに基づき、上部に検索バー、左側にメインコンテンツエリア、右側にタブナビゲーションを配置した効率的なレイアウトを採用します。

## アーキテクチャ

### 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│  Popup UI (React 19 + TypeScript)                          │
│  ├── Header (Repository Search + Settings)                 │
│  ├── Main Content Area (Left Side)                         │
│  └── Tab Navigation (Right Side)                           │
├─────────────────────────────────────────────────────────────┤
│  Background Service Worker                                  │
│  ├── GitHub API Integration                                │
│  ├── Notification Polling                                  │
│  └── Data Caching                                          │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer (Plasmo Storage API)                        │
│  ├── User Authentication                                   │
│  ├── Repository Data                                       │
│  ├── Notifications                                         │
│  └── User Preferences                                      │
└─────────────────────────────────────────────────────────────┘
```

### 技術スタック

- **フレームワーク**: Plasmo v0.90.5 (Manifest V3対応)
- **UI**: React 19 + TypeScript 5.8.3
- **スタイリング**: Tailwind CSS v4.1.11
- **UIコンポーネント**: shadcn/ui (46コンポーネント)
- **状態管理**: Plasmo Storage API + useStorage hook
- **アイコン**: @primer/octicons-react + Lucide React
- **ドラッグ&ドロップ**: @dnd-kit/core
- **多言語**: Chrome i18n API + react-i18next
- **バリデーション**: Zod v4.0.5

## コンポーネントとインターフェース

### 1. ポップアップレイアウト構造

```
┌─────────────────────────────────────────────────────────────┐
│ Header (固定)                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🔍] Repository Search Input          [⚙️] Settings    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Main Layout (600 × 600px)                                │
│ ┌─────────────────────────────┬─────────────────────────────┐ │
│ │                             │                             │ │
│ │ Main Content Area           │ Tab Navigation              │ │
│ │ (Left Side - 2/3 width)     │ (Right Side - 1/3 width)   │ │
│ │                             │                             │ │
│ │ • Dashboard View            │ • Issues                    │ │
│ │ • Notification List         │ • Pull Requests             │ │
│ │ • Search Results            │ • Actions                   │ │
│ │ • Shortcut Grid             │ • Custom Links              │ │
│ │                             │                             │ │
│ │                             │                             │ │
│ │                             │                             │ │
│ └─────────────────────────────┴─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. コンポーネント階層

```typescript
// src/popup/index.tsx
export default function Popup() {
  return (
    <div className="w-150 h-150 flex flex-col">
      <Header />
      <MainLayout />
    </div>
  )
}

// Header Component
function Header() {
  return (
    <div className="p-2 border-b">
      <div className="flex items-center justify-between">
        <RepositorySearch />
        <SettingsButton />
      </div>
    </div>
  )
}

// Main Layout Component
function MainLayout() {
  return (
    <div className="grid grid-cols-2 flex-1">
      <MainContentArea className="col-span-2" />
      <TabNavigation className="col-span-1" />
    </div>
  )
}
```

### 3. 主要コンポーネント

#### RepositorySearch Component

```typescript
interface RepositorySearchProps {
    onRepositorySelect: (repo: Repository) => void
    selectedRepository?: Repository
}

// Features:
// - オートコンプリート検索 (shadcn/ui Command)
// - 最近使用したリポジトリ表示
// - お気に入りリポジトリ表示
// - GitHub API /user/repos 連携
```

#### MainContentArea Component

```typescript
interface MainContentAreaProps {
    activeTab: TabType
    selectedRepository: Repository | null
}

// Dynamic content based on selected tab:
// - Dashboard: Repository overview + quick stats
// - Notifications: Filtered notification list
// - Search: Search results display
// - Shortcuts: Draggable shortcut grid
```

#### TabNavigation Component

```typescript
interface TabNavigationProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
    notificationCount?: number
}

// Vertical tab list:
// - Issues (with count badge)
// - Pull Requests (with count badge)
// - Actions
// - Custom Links
// - Settings
```

## データモデル（Zod スキーマ定義）

### Zod スキーマとバリデーション

```typescript
import { z } from 'zod'

// 1. Repository Schema
const RepositoryOwnerSchema = z.object({
    login: z.string(),
    avatar_url: z.string().url(),
})

const RepositorySchema = z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    owner: RepositoryOwnerSchema,
    description: z.string().nullable().optional(),
    private: z.boolean(),
    html_url: z.string().url(),
    clone_url: z.string().url(),
    ssh_url: z.string(),
    default_branch: z.string(),
    language: z.string().nullable().optional(),
    stargazers_count: z.number(),
    forks_count: z.number(),
    open_issues_count: z.number(),
    updated_at: z.string().datetime(),
    // Extension metadata
    is_favorite: z.boolean().default(false),
    last_accessed: z.string().datetime(),
})

// 2. Notification Schema
const NotificationReasonSchema = z.enum([
    'assign',
    'author',
    'comment',
    'invitation',
    'manual',
    'mention',
    'review_requested',
    'security_alert',
    'state_change',
    'subscribed',
    'team_mention',
])

const NotificationSubjectSchema = z.object({
    title: z.string(),
    url: z.string().url(),
    latest_comment_url: z.string().url().optional(),
    type: z.enum(['Issue', 'PullRequest', 'Commit', 'Release']),
})

const NotificationRepositorySchema = z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
    owner: RepositoryOwnerSchema,
    html_url: z.string().url(),
})

const NotificationSchema = z.object({
    id: z.string(),
    unread: z.boolean(),
    reason: NotificationReasonSchema,
    updated_at: z.string().datetime(),
    last_read_at: z.string().datetime().optional(),
    subject: NotificationSubjectSchema,
    repository: NotificationRepositorySchema,
    url: z.string().url(),
    subscription_url: z.string().url(),
})

// 3. Shortcut Schema
const ShortcutCategorySchema = z.enum(['repository', 'organization', 'custom'])

const ShortcutSchema = z.object({
    id: z.string().uuid(),
    label: z.string().min(1).max(50),
    url: z.string().url(),
    icon: z.string().optional(), // Octicon name or Lucide icon name
    favicon_url: z.string().url().optional(),
    position: z.number().int().min(0),
    created_at: z.string().datetime(),
    category: ShortcutCategorySchema.optional(),
})

// 4. User Settings Schema
const ThemeSchema = z.enum(['light', 'dark', 'system'])
const LanguageSchema = z.enum(['en', 'ja'])
const GridSizeSchema = z.enum(['4x5', '3x4', '5x6'])

const NotificationFiltersSchema = z.object({
    types: z.array(NotificationReasonSchema),
    repositories: z.array(z.string()), // repository full_names
})

const NotificationSettingsSchema = z.object({
    desktop_enabled: z.boolean().default(true),
    sound_enabled: z.boolean().default(false),
    polling_interval: z.number().int().min(1).max(60).default(5), // minutes
    filters: NotificationFiltersSchema,
})

const ShortcutSettingsSchema = z.object({
    grid_size: GridSizeSchema.default('4x5'),
    show_labels: z.boolean().default(true),
})

const CacheDurationSchema = z.object({
    repositories: z.number().int().min(1).max(168).default(24), // hours
    notifications: z.number().int().min(1).max(60).default(5), // minutes
    issues: z.number().int().min(1).max(60).default(15), // minutes
})

const PerformanceSettingsSchema = z.object({
    cache_duration: CacheDurationSchema,
})

const UserSettingsSchema = z.object({
    theme: ThemeSchema.default('system'),
    language: LanguageSchema.default('en'),
    notifications: NotificationSettingsSchema,
    shortcuts: ShortcutSettingsSchema,
    performance: PerformanceSettingsSchema,
})

// Type inference from Zod schemas
export type Repository = z.infer<typeof RepositorySchema>
export type RepositoryOwner = z.infer<typeof RepositoryOwnerSchema>
export type Notification = z.infer<typeof NotificationSchema>
export type NotificationReason = z.infer<typeof NotificationReasonSchema>
export type NotificationSubject = z.infer<typeof NotificationSubjectSchema>
export type NotificationRepository = z.infer<
    typeof NotificationRepositorySchema
>
export type Shortcut = z.infer<typeof ShortcutSchema>
export type ShortcutCategory = z.infer<typeof ShortcutCategorySchema>
export type UserSettings = z.infer<typeof UserSettingsSchema>
export type Theme = z.infer<typeof ThemeSchema>
export type Language = z.infer<typeof LanguageSchema>
export type GridSize = z.infer<typeof GridSizeSchema>

// Export schemas for validation
export {
    RepositorySchema,
    RepositoryOwnerSchema,
    NotificationSchema,
    NotificationReasonSchema,
    NotificationSubjectSchema,
    NotificationRepositorySchema,
    ShortcutSchema,
    ShortcutCategorySchema,
    UserSettingsSchema,
    ThemeSchema,
    LanguageSchema,
    GridSizeSchema,
    NotificationFiltersSchema,
    NotificationSettingsSchema,
    ShortcutSettingsSchema,
    CacheDurationSchema,
    PerformanceSettingsSchema,
}
```

### データバリデーション戦略

```typescript
// lib/validation.ts
import { z } from 'zod'

// Generic validation function
export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
): T {
    try {
        return schema.parse(data)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = `Validation failed${context ? ` for ${context}` : ''}: ${error.errors
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

// Usage examples:
// const repo = validateData(RepositorySchema, apiResponse, 'GitHub API response')
// const settings = safeValidateData(UserSettingsSchema, storageData)
```

## エラーハンドリング

### 1. API エラー処理（Zod統合）

```typescript
// lib/github-api.ts
import { z } from 'zod'

import { validateData } from '@/lib/validation'

class GitHubAPIError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: any
    ) {
        super(message)
        this.name = 'GitHubAPIError'
    }
}

// API Response validation
async function fetchRepositories(): Promise<Repository[]> {
    try {
        const response = await fetch('/user/repos', {
            headers: { Authorization: `token ${token}` },
        })

        if (!response.ok) {
            throw new GitHubAPIError(
                'Failed to fetch repositories',
                response.status,
                response
            )
        }

        const data = await response.json()

        // Validate response data with Zod
        return validateData(
            z.array(RepositorySchema),
            data,
            'GitHub repositories API response'
        )
    } catch (error) {
        if (error instanceof GitHubAPIError) {
            throw error
        }
        throw new GitHubAPIError('Network error', 0, error)
    }
}

// Error handling strategy with validation
async function handleAPIRequest<T>(
    request: () => Promise<T>,
    retryCount = 3
): Promise<T> {
    try {
        return await request()
    } catch (error) {
        if (error instanceof GitHubAPIError) {
            switch (error.status) {
                case 401:
                    await triggerReauth()
                    throw new Error(
                        '認証が必要です。再度ログインしてください。'
                    )
                case 403:
                    const resetTime =
                        error.response?.headers?.['x-ratelimit-reset']
                    throw new Error(
                        `API制限に達しました。${formatResetTime(resetTime)}に再試行してください。`
                    )
                case 404:
                    throw new Error('リソースが見つかりません。')
                default:
                    if (retryCount > 0) {
                        await delay(Math.pow(2, 3 - retryCount) * 1000)
                        return handleAPIRequest(request, retryCount - 1)
                    }
                    throw new Error('APIリクエストに失敗しました。')
            }
        }
        throw error
    }
}
```

### 2. ストレージデータバリデーション

```typescript
// lib/storage.ts
import { useStorage } from '@plasmohq/storage/hook'

import { safeValidateData, validateData } from '@/lib/validation'

// Type-safe storage hook with validation
export function useValidatedStorage<T>(
    key: string,
    schema: z.ZodSchema<T>,
    defaultValue: T
) {
    const [rawValue, setRawValue] = useStorage(key, defaultValue)

    // Validate on read
    const validatedValue = useMemo(() => {
        if (rawValue === defaultValue) return defaultValue

        const result = safeValidateData(schema, rawValue)
        if (result.success) {
            return result.data
        } else {
            console.warn(`Invalid storage data for key "${key}":`, result.error)
            return defaultValue
        }
    }, [rawValue, schema, defaultValue, key])

    // Validate on write
    const setValidatedValue = useCallback(
        (value: T) => {
            const validated = validateData(
                schema,
                value,
                `storage key "${key}"`
            )
            setRawValue(validated)
        },
        [setRawValue, schema, key]
    )

    return [validatedValue, setValidatedValue] as const
}

// Usage:
// const [settings, setSettings] = useValidatedStorage(
//   'userSettings',
//   UserSettingsSchema,
//   defaultSettings
// )
```

## テスト戦略

### 1. Zodスキーマテスト

```typescript
// __tests__/schemas/repository.test.ts
import { describe, expect, it } from 'vitest'

import { RepositorySchema } from '@/lib/schemas'

describe('RepositorySchema', () => {
    it('should validate valid repository data', () => {
        const validRepo = {
            id: 123,
            name: 'test-repo',
            full_name: 'user/test-repo',
            owner: {
                login: 'user',
                avatar_url: 'https://github.com/avatar.jpg',
            },
            private: false,
            html_url: 'https://github.com/user/test-repo',
            clone_url: 'https://github.com/user/test-repo.git',
            ssh_url: 'git@github.com:user/test-repo.git',
            default_branch: 'main',
            stargazers_count: 10,
            forks_count: 5,
            open_issues_count: 2,
            updated_at: '2023-01-01T00:00:00Z',
            is_favorite: false,
            last_accessed: '2023-01-01T00:00:00Z',
        }

        expect(() => RepositorySchema.parse(validRepo)).not.toThrow()
    })

    it('should reject invalid repository data', () => {
        const invalidRepo = {
            id: 'not-a-number',
            name: '',
            // missing required fields
        }

        expect(() => RepositorySchema.parse(invalidRepo)).toThrow()
    })
})
```

### 2. 統合テスト（バリデーション付き）

```typescript
// __tests__/integration/api.test.ts
import { describe, expect, it, vi } from 'vitest'

import { fetchRepositories } from '@/lib/github-api'
import { RepositorySchema } from '@/lib/schemas'

describe('GitHub API Integration', () => {
    it('should fetch and validate repositories', async () => {
        const mockResponse = [
            {
                id: 123,
                name: 'test-repo',
                // ... valid repository data
            },
        ]

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse),
        })

        const repositories = await fetchRepositories()

        // Verify data structure matches schema
        repositories.forEach((repo) => {
            expect(() => RepositorySchema.parse(repo)).not.toThrow()
        })
    })
})
```

この設計文書では、Zodを使用した包括的な型定義とバリデーション戦略を組み込みました。次に、タスクリストもZodの使用を反映するように更新しましょうか？
