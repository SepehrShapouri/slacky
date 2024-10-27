'use client'
import { Provider } from "jotai"
import { ReactNode } from "react"
type JotaiProviderProps = {
    children:ReactNode
}
export function JotaiProvider({children}:JotaiProviderProps){
return <Provider>
    {children}
</Provider>
}