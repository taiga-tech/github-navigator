import { ThemeToggle } from '@/components/github/theme-toggle'

export function Header() {
    return (
        <header className="border-border bg-background border-b px-8 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-foreground text-2xl font-bold">
                        GitHub Dark Theme for shadcn/ui
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        GitHubのダークテーマを忠実に再現
                    </p>
                </div>
                <ThemeToggle />
            </div>
        </header>
    )
}
