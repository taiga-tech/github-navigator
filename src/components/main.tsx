'use client'

import { memo, useState } from 'react'

import {
    GearIcon,
    GitPullRequestIcon,
    HomeIcon,
    IssueOpenedIcon,
    LinkIcon,
    PlayIcon,
} from '@primer/octicons-react'

import {
    AuthComponent,
    AuthGuard,
    GitHubCard,
    Header,
    RepoCard,
} from '@/components/github'
import { MainLayout } from '@/components/layout/main-layout'
import { PopupContainer } from '@/components/layout/popup-container'
import { Providers } from '@/components/providers'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import '@/styles/globals.css'

// サンプルリポジトリデータ（コンポーネント外で定義）
const SAMPLE_REPOS = [
    {
        id: 'github-navigator',
        name: 'github-navigator',
        visibility: 'Public' as const,
        description: 'A Chrome extension for efficient GitHub navigation',
        language: 'TypeScript',
        languageColor: '#3178c6',
        stars: '12',
    },
    {
        id: 'my-project',
        name: 'my-project',
        visibility: 'Private' as const,
        description: 'Personal project for learning React and TypeScript',
        language: 'JavaScript',
        languageColor: '#f1e05a',
        stars: '3',
    },
] as const

// Main authenticated content component
const AuthenticatedContent = memo(function AuthenticatedContent() {
    const [activeTab, setActiveTab] = useState<string>('dashboard')

    const handleSettingsClick = () => {
        setActiveTab('settings')
    }

    // Dashboard Content Component
    const DashboardContent = () => (
        <div className="p-4">
            <GitHubCard
                title="Recent Repositories"
                status={{
                    label: 'Active',
                    variant: 'success',
                }}
            >
                <div className="space-y-3">
                    {SAMPLE_REPOS.map((repo) => (
                        <RepoCard
                            key={repo.id}
                            name={repo.name}
                            visibility={repo.visibility}
                            description={repo.description}
                            language={repo.language}
                            languageColor={repo.languageColor}
                            stars={repo.stars}
                        />
                    ))}
                </div>
            </GitHubCard>
        </div>
    )

    // Issues Content Component
    const IssuesContent = () => (
        <div className="p-4">
            <GitHubCard
                title="Issues"
                status={{
                    label: 'Open',
                    variant: 'info',
                }}
            >
                <div className="text-muted-foreground py-8 text-center">
                    Issues functionality will be implemented here
                </div>
            </GitHubCard>
        </div>
    )

    // Pull Requests Content Component
    const PullRequestsContent = () => (
        <div className="p-4">
            <GitHubCard
                title="Pull Requests"
                status={{
                    label: 'Open',
                    variant: 'info',
                }}
            >
                <div className="text-muted-foreground py-8 text-center">
                    Pull Requests functionality will be implemented here
                </div>
            </GitHubCard>
        </div>
    )

    // Actions Content Component
    const ActionsContent = () => (
        <div className="p-4">
            <GitHubCard
                title="GitHub Actions"
                status={{
                    label: 'Running',
                    variant: 'warning',
                }}
            >
                <div className="text-muted-foreground py-8 text-center">
                    Actions functionality will be implemented here
                </div>
            </GitHubCard>
        </div>
    )

    // Custom Links Content Component
    const CustomLinksContent = () => (
        <div className="p-4">
            <GitHubCard
                title="Custom Links"
                status={{
                    label: 'Ready',
                    variant: 'success',
                }}
            >
                <div className="text-muted-foreground py-8 text-center">
                    Custom Links functionality will be implemented here
                </div>
            </GitHubCard>
        </div>
    )

    // Settings Content Component
    const SettingsContent = () => (
        <div className="p-4">
            <GitHubCard
                title="Settings"
                status={{
                    label: 'Configuration',
                    variant: 'info',
                }}
            >
                <div className="text-muted-foreground py-8 text-center">
                    Settings functionality will be implemented here
                </div>
            </GitHubCard>
        </div>
    )

    // Main content based on active tab
    const getMainContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardContent />
            case 'issues':
                return <IssuesContent />
            case 'pull-requests':
                return <PullRequestsContent />
            case 'actions':
                return <ActionsContent />
            case 'custom-links':
                return <CustomLinksContent />
            case 'settings':
                return <SettingsContent />
            default:
                return <DashboardContent />
        }
    }

    const mainContent = getMainContent()

    // Sidebar content for the right side - Vertical tab selection
    const sidebarContent = (
        <div className="p-2">
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
                orientation="vertical"
            >
                <TabsList className="flex h-auto w-full flex-col space-y-1 bg-transparent p-0">
                    <TabsTrigger
                        value="dashboard"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full justify-start px-3 py-2 text-sm"
                    >
                        <HomeIcon size={16} className="mr-2" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger
                        value="issues"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full justify-start px-3 py-2 text-sm"
                    >
                        <IssueOpenedIcon size={16} className="mr-2" />
                        Issues
                    </TabsTrigger>
                    <TabsTrigger
                        value="pull-requests"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full justify-start px-3 py-2 text-sm"
                    >
                        <GitPullRequestIcon size={16} className="mr-2" />
                        Pull Requests
                    </TabsTrigger>
                    <TabsTrigger
                        value="actions"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full justify-start px-3 py-2 text-sm"
                    >
                        <PlayIcon size={16} className="mr-2" />
                        Actions
                    </TabsTrigger>
                    <TabsTrigger
                        value="custom-links"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full justify-start px-3 py-2 text-sm"
                    >
                        <LinkIcon size={16} className="mr-2" />
                        Custom Links
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground w-full justify-start px-3 py-2 text-sm"
                    >
                        <GearIcon size={16} className="mr-2" />
                        Settings
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )

    return (
        <div className="flex h-full flex-col">
            {/* Header Component */}
            <Header onSettingsClick={handleSettingsClick} />

            {/* Main Layout - 2:1 ratio for left:right */}
            <MainLayout
                mainContent={mainContent}
                sidebarContent={sidebarContent}
            />
        </div>
    )
})

export const Main = memo(function Main() {
    return (
        <Providers>
            <PopupContainer>
                <AuthGuard
                    fallback={
                        <div className="flex h-full items-center justify-center p-4">
                            <AuthComponent />
                        </div>
                    }
                >
                    <AuthenticatedContent />
                </AuthGuard>
            </PopupContainer>
        </Providers>
    )
})
