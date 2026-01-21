'use client'

import { useState, useEffect } from 'react'
import { Megaphone, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Announcement {
    id: string
    title: string
    message: string
    link?: string
    imageUrl?: string
    actionText?: string
    type: string
}

export function AnnouncementBanner() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        fetchLatestBanner()
    }, [])

    async function fetchLatestBanner() {
        try {
            const res = await fetch('/api/admin/announcements')
            if (res.ok) {
                const data = await res.json()
                // Get the most recent active banner
                const banner = data.find((a: any) => a.type === 'BANNER' && a.isActive)
                if (banner) {
                    setAnnouncement(banner)
                }
            }
        } catch (error) {
            console.error('Failed to fetch banner', error)
        }
    }

    if (!announcement || !isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mb-6"
            >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-0 text-white shadow-lg shadow-blue-500/20">
                    {/* Background decoration or Image */}
                    {announcement.imageUrl ? (
                        <div className="absolute inset-0 z-0">
                            <img
                                src={announcement.imageUrl}
                                alt=""
                                className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/80" />
                        </div>
                    ) : (
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Megaphone className="w-24 h-24 transform rotate-12" />
                        </div>
                    )}

                    <div className="relative z-10 p-4 sm:p-5 flex items-start gap-4">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded-md">
                                    <Megaphone className="w-4 h-4" />
                                </span>
                                {announcement.title}
                            </h3>
                            <p className="text-blue-50 text-sm leading-relaxed max-w-2xl">
                                {announcement.message}
                            </p>

                            {announcement.link && (
                                <Link
                                    href={announcement.link}
                                    className="inline-flex items-center gap-2 mt-3 text-xs font-bold uppercase tracking-wider bg-white text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                    {announcement.actionText || 'Learn More'} <ArrowRight className="w-3 h-3" />
                                </Link>
                            )}
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-blue-200 hover:text-white transition-colors p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
