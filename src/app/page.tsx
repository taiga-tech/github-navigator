import { ColorPalette } from '@/components/demo/color-palette'
import { ComponentShowcase } from '@/components/demo/component-showcase'
import { GitHubShowcase } from '@/components/demo/github-showcase'
import { Header } from '@/components/demo/header'

const IndexPage = () => {
    return (
        <div className="bg-background min-h-screen">
            <Header />

            <main className="container mx-auto space-y-12 px-8 py-8">
                <ColorPalette />
                <ComponentShowcase />
                <GitHubShowcase />
            </main>
        </div>
    )
}

export default IndexPage
