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
                        <GlassCard className="flex flex-col h-full overflow-hidden p-6 space-y-6" hover={false}>
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-14 h-14 rounded-2xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-3/4" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/20 rounded-2xl p-4 space-y-2">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <div className="bg-muted/20 rounded-2xl p-4 space-y-2">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>

                            <Skeleton className="h-12 w-full rounded-2xl mt-auto" />
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
