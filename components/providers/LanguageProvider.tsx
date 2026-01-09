'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { LogoLoader } from '@/components/ui/LogoLoader'

type Language = 'en' | 'ny'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string, variables?: Record<string, string | number>) => string
    isLoaded: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en')
    const [dictionary, setDictionary] = useState<Record<string, any>>({})
    const [isLoaded, setIsLoaded] = useState(false)

    // Load dictionary effect
    useEffect(() => {
        let isMounted = true;

        const loadDictionary = async () => {
            setIsLoaded(false)
            try {
                // Dynamic import for bundle splitting
                const dict = await import(`../../dictionaries/${language}.json`)
                if (isMounted) {
                    setDictionary(dict.default || dict)
                    setIsLoaded(true)
                }
            } catch (error) {
                console.error(`Failed to load dictionary for language: ${language}`, error)
                // Fallback attempt to english if failed
                if (language !== 'en') {
                    try {
                        const enDict = await import(`../../dictionaries/en.json`)
                        if (isMounted) {
                            setDictionary(enDict.default || enDict)
                            setIsLoaded(true)
                        }
                    } catch (e) { console.error("Fatal: Could not load fallback dictionary", e) }
                }
            }
        }

        loadDictionary()

        return () => { isMounted = false }
    }, [language])

    // Initial language detection
    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language
        if (savedLang && ['en', 'ny'].includes(savedLang)) {
            setLanguageState(savedLang)
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0]
            if (['en', 'ny'].includes(browserLang)) {
                setLanguageState(browserLang as Language)
            }
        }
    }, [])

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('app-language', lang)
    }, [])

    const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
        if (!dictionary) return key

        const keys = key.split('.')
        let result: any = dictionary

        // Find the translation string
        for (const k of keys) {
            if (result && k in result) {
                result = result[k]
            } else {
                return key
            }
        }

        if (typeof result !== 'string') return key

        // Replace variables if provided
        if (variables) {
            Object.entries(variables).forEach(([vKey, vValue]) => {
                result = (result as string).replace(`{${vKey}}`, vValue.toString())
            });
        }

        return result
    }, [dictionary])

    // Show loader while initial dictionary fetches to prevent "Flash of Unstyled Text" (FOUT) / Keys
    // This also solves hydration mismatch concepts because we only render children when ready on client
    if (!isLoaded) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <LogoLoader className="w-20 h-20 text-primary" />
            </div>
        )
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
