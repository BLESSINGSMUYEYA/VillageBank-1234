'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { GlassCard } from "@/components/ui/GlassCard"
import { PageHeader } from "@/components/layout/PageHeader"
import { motion } from "framer-motion"
import { staggerContainer, fadeIn, itemFadeIn } from "@/lib/motions"

export function GroupsSkeleton() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-10 pb-10"
        >
            <PageHeader
                title={<Skeleton className="h-10 w-[250px]" />}
                description={<Skeleton className="h-4 w-[400px]" />}
                action={
                    <div className="flex gap-3">
                        <Skeleton className="h-12 w-32 rounded-xl" />
                        <Skeleton className="h-12 w-32 rounded-xl" />
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div key={i} variants={itemFadeIn}>
                        <GlassCard className="flex flex-col h-full overflow-hidden" hover={false}>
                            <div className="p-6 pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="w-16 h-16 rounded-2xl" />
                                        <div className="space-y-3 flex-1">
                                            <Skeleton className="h-6 w-32" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-4 w-12 rounded-lg" />
                                                <Skeleton className="h-4 w-16 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                </div>
                            </div>

                            <div className="px-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Skeleton className="h-[72px] rounded-3xl" />
                                    <Skeleton className="h-[72px] rounded-3xl" />
                                </div>
                                <Skeleton className="h-[104px] rounded-3xl" />
                            </div>

                            <div className="p-6 pt-6">
                                <Skeleton className="h-14 w-full rounded-2xl" />
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}

                {/* Skeleton for 'Add New Group' card */}
                <motion.div variants={itemFadeIn}>
                    <div className="h-full min-h-[380px] rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-8">
                        <Skeleton className="w-24 h-24 rounded-3xl mb-6" />
                        <Skeleton className="h-8 w-40 mb-3" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
