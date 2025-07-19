'use client'

import { useState } from 'react'

import { Providers } from '@/components/providers'

import '@/styles/globals.css'

interface Props {
    name?: string
}

export const Main = ({ name = 'Extension' }: Readonly<Props>) => {
    const [data, setData] = useState('')

    return (
        <Providers>
            <div className="flex w-100 flex-col p-4">
                <h1>
                    Welcome to your <a href="https://www.plasmo.com">Plasmo</a>{' '}
                    {name}!
                </h1>
                <input onChange={(e) => setData(e.target.value)} value={data} />

                <a href="https://docs.plasmo.com">READ THE DOCS!</a>
            </div>
        </Providers>
    )
}
