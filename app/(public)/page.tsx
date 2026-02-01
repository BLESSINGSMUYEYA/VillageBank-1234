'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/providers/AuthProvider'
import Image from 'next/image'

export default function Home() {
    const router = useRouter()
    const { user, loading, isAuthenticated } = useAuth()
    const [mounted, setMounted] = useState(false)


    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        // Wait for auth to finish
        if (!loading && mounted) {
            if (isAuthenticated && user) {
                if (user.role === 'REGIONAL_ADMIN') {
                    router.push('/admin/regional');
                } else if (user.role === 'SUPER_ADMIN') {
                    router.push('/admin/system');
                } else {
                    router.push('/dashboard');
                }
            } else {
                router.push('/login');
            }
        }
    }, [loading, isAuthenticated, user, router, mounted])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="relative z-10 animate-in fade-in zoom-in duration-700">
                <Image
                    src="/ubank-logo.png"
                    alt="uBank Logo"
                    width={128}
                    height={128}
                    className="object-contain"
                    priority
                />
            </div>
        </div>
    )
}
