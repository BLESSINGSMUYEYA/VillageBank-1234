

import { getAllActivities } from '@/lib/dashboard-service'
import { ArrowLeft, Zap, Shield } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { ActivityFeedClient } from '@/components/dashboard/ActivityFeedClient'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
    title: 'Your Activity | Village Bank',
    description: 'View your recent activity history across all groups.',
}

export default async function ActivityPage() {
    const activities = await getAllActivities()

    return (
        <div className="container max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8 pb-20">
            {/* Minimal Header */}
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 dark:hover:text-banana transition-all duration-300 group mb-6"
                >
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-4">
                            Activity <span className="text-blue-600 dark:text-banana">History</span>
                        </h1>
                        <p className="text-base font-medium text-muted-foreground max-w-lg leading-relaxed">
                            A unified timeline of all your financial movements, community interactions, and protocol events.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500 fill-purple-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
                            Recent Transactions
                        </h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/50">
                        Showing last {activities.length} items
                    </span>
                </div>

                <ActivityFeedClient activities={activities} />
            </div>
        </div>
    )
}
