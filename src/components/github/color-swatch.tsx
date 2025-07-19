interface ColorSwatchProps {
    name: string
    hex: string
    usage: string
}

export function ColorSwatch({ name, hex, usage }: ColorSwatchProps) {
    return (
        <div className="border-border bg-card rounded-lg border p-4">
            <div
                className="border-border mb-3 h-16 w-full rounded-md border"
                style={{ backgroundColor: hex }}
            />
            <div className="space-y-1">
                <div className="text-card-foreground font-medium">{name}</div>
                <div className="text-muted-foreground font-mono text-sm">
                    {hex}
                </div>
                <div className="text-muted-foreground text-sm">{usage}</div>
            </div>
        </div>
    )
}
