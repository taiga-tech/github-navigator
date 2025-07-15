import { ColorSwatch } from '@/components/github'

const baseColors = [
    { name: 'Background', hex: '#0d1117', usage: 'メインの背景' },
    { name: 'Card', hex: '#161b22', usage: 'カードの背景' },
    { name: 'Secondary', hex: '#21262d', usage: 'セカンダリ背景' },
    { name: 'Border', hex: '#30363d', usage: 'ボーダーカラー' },
    { name: 'Text Muted', hex: '#6e7681', usage: '控えめテキスト' },
    { name: 'Text', hex: '#f0f6fc', usage: 'プライマリテキスト' },
]

const semanticColors = [
    { name: 'Primary', hex: '#58a6ff', usage: 'プライマリアクション' },
    { name: 'Success', hex: '#3fb950', usage: '成功状態' },
    { name: 'Warning', hex: '#d29922', usage: '警告状態' },
    { name: 'Danger', hex: '#f85149', usage: 'エラー状態' },
    { name: 'Done', hex: '#a5a2ff', usage: '完了状態' },
    { name: 'Sponsors', hex: '#db61a2', usage: 'スポンサー/特別' },
]

export function ColorPalette() {
    return (
        <section className="space-y-8">
            <h2 className="text-foreground text-xl font-semibold">
                カラーパレット
            </h2>

            <div className="space-y-8">
                <div>
                    <h3 className="text-foreground mb-4 text-lg font-medium">
                        ベースカラー
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {baseColors.map((color) => (
                            <ColorSwatch
                                key={color.name}
                                name={color.name}
                                hex={color.hex}
                                usage={color.usage}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-foreground mb-4 text-lg font-medium">
                        セマンティックカラー
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {semanticColors.map((color) => (
                            <ColorSwatch
                                key={color.name}
                                name={color.name}
                                hex={color.hex}
                                usage={color.usage}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
