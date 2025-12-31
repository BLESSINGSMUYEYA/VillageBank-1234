'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { GlassCard } from "@/components/ui/GlassCard"
import { PageHeader } from "@/components/layout/PageHeader"
import { motion } from "framer-motion"
import { staggerContainer, fadeIn, itemFadeIn } from "@/lib/motions"

export function DashboardSkeleton() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-10 pb-10"
        >
            {/* Header Skeleton */}
            <motion.div variants={fadeIn}>
                <PageHeader
                    title={<Skeleton className="h-10 w-[200px]" />}
                    description={<Skeleton className="h-4 w-[300px]" />}
                    action={<Skeleton className="h-12 w-[180px] rounded-xl" />}
                />
            </motion.div>

            {/* Stats Grid Skeleton */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 no-scrollbar">
                {Array.from({ length: 4 }).map((_, i) => (
                    <GlassCard key={i} className="shrink-0 w-[280px] sm:w-auto p-6 space-y-4" hover={false}>
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-10 rounded-xl" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-3 w-40" />
                    </GlassCard>
                ))}
            </div>

            {/* Main Content Split Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Column: Charts Skeleton */}
                <motion.div variants={itemFadeIn} className="xl:col-span-2 space-y-6 sm:space-y-8">
                    <GlassCard className="p-1 sm:p-2" hover={false}>
                        <div className="rounded-2xl overflow-hidden bg-card/30 p-6 space-y-6">
                            <div className="flex justify-between items-end">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                </div>
                            </div>
                            <Skeleton className="h-[300px] w-full rounded-2xl" />
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Right Column Skeleton */}
                <div className="space-y-6 sm:space-y-8 flex flex-col">
                    {/* Activity Feed Skeleton */}
                    <GlassCard className="flex-1 p-0 overflow-hidden" hover={false}>
                        <div className="p-5 border-b border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-2xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-2/3" />
                                            <Skeleton className="h-4 w-12 rounded-full" />
                                        </div>
                                        <div className="flex justify-between">
                                            <Skeleton className="h-3 w-1/3" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </motion.div>
    )
}
