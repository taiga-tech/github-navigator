'use client'

import { useTheme } from 'next-themes'

import { DeviceDesktopIcon, MoonIcon, SunIcon } from '@primer/octicons-react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <Select value={theme} onValueChange={setTheme} defaultValue="system">
            <SelectTrigger className="min-w-32 gap-2">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="light">
                    <div className="flex items-center gap-2">
                        <SunIcon size={16} />
                        <span>ライト</span>
                    </div>
                </SelectItem>
                <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                        <MoonIcon size={16} />
                        <span>ダーク</span>
                    </div>
                </SelectItem>
                <SelectItem value="system">
                    <div className="flex items-center gap-2">
                        <DeviceDesktopIcon size={16} />
                        <span>システム</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    )
}
