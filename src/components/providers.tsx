'use client'

import type { PropsWithChildren } from 'react'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export const Providers = ({ children }: Readonly<PropsWithChildren>) => {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
        >
            {children}
        </NextThemesProvider>
    )
}
