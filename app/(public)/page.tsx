'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function Home() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setTimeout(() => {
            router.push('/login')
        }, 2000)

        return () => clearTimeout(timer)
    }, [router])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-800/20 rounded-full blur-[120px] animate-pulse-slow" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
                {/* Logo / Icon Area */}
                <div className="w-32 h-32 bg-emerald-800/50 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-emerald-700/50 shadow-2xl">
                    <span className="text-6xl font-black text-emerald-50 font-heading">u</span>
                </div>

                {/* Loading Indicator */}
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-emerald-200/80 animate-spin" />
                    <p className="text-emerald-200/60 font-medium text-sm tracking-wider uppercase animate-pulse">Loading uBank</p>
                </div>
            </div>
        </div>
    )
}
