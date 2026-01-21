'use client'

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { GlassCard } from "@/components/ui/GlassCard"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// ==========================================
// Base Component Re-export
// ==========================================
export { Skeleton }

// ==========================================
// Dashboard Skeletons
// ==========================================

export function HeroSkeleton() {
    return (
        <div className="relative rounded-[32px] border border-white/10 overflow-hidden bg-white/5 h-[400px] animate-pulse">
            <div className="p-10 space-y-4">
                <Skeleton className="h-12 w-64 bg-white/10" />
                <Skeleton className="h-6 w-96 bg-white/5" />
            </div>
            <div className="absolute bottom-0 w-full grid grid-cols-4 border-t border-white/10 h-32 divide-x divide-white/10">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-8">
                        <Skeleton className="h-4 w-20 mb-2 bg-white/10" />
                        <Skeleton className="h-8 w-16 bg-white/10" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function DashboardChartsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-1 rounded-full bg-blue-600" />
                <Skeleton className="h-6 w-48 bg-white/10" />
            </div>
            <GlassCard className="h-[400px] flex items-center justify-center p-0">
                <Skeleton className="w-full h-full bg-white/5" />
            </GlassCard>
        </div>
    )
}

export function DashboardActivitySkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-1 rounded-full bg-purple-600" />
                <Skeleton className="h-6 w-32 bg-white/10" />
            </div>
            <GlassCard className="h-[300px] p-0">
                <div className="p-6 border-b border-white/5">
                    <Skeleton className="h-6 w-24 bg-white/10" />
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4 bg-white/10" />
                                <Skeleton className="h-3 w-1/2 bg-white/5" />
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6 sm:space-y-10 pb-10">
            <HeroSkeleton />
            <div className="space-y-12 sm:space-y-16">
                <DashboardChartsSkeleton />
                <DashboardActivitySkeleton />
            </div>
        </div>
    )
}

// ==========================================
// Component Skeletons
// ==========================================

export function StatsCardSkeleton() {
    return (
        <Card className="bg-card/50 backdrop-blur-md border-border/50 rounded-3xl h-full border">
            <CardHeader className="pb-2 p-3.5 sm:p-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-6 pt-0">
                <Skeleton className="h-10 w-32" />
                <div className="flex items-center justify-between mt-3">
                    <Skeleton className="h-3 w-24" />
                </div>
            </CardContent>
        </Card>
    )
}

export function ActivityItemSkeleton() {
    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
            </div>
        </div>
    )
}

export function ContributionRowSkeleton() {
    return (
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-border/50 items-center">
            <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <div className="flex justify-end">
                <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
        </div>
    )
}

export function VaultCreditSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-md border-border/50 rounded-[32px] p-8 h-full border">
                    <div className="flex justify-between items-start mb-8">
                        <Skeleton className="w-14 h-14 rounded-2xl" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="space-y-2 mb-8">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="pt-8 border-t border-border/10 mt-auto">
                        <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                </Card>
            ))}
        </div>
    )
}

// ==========================================
// Generic Skeletons
// ==========================================

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <div className="flex items-center space-x-4 p-4 border-b border-border/50 h-20">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-6",
                        i === 0 ? "w-1/4" : "w-1/6",
                        i === columns - 1 ? "ml-auto" : ""
                    )}
                />
            ))}
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="bg-card border border-border/50 rounded-3xl p-6 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
        </div>
    )
}

export function GroupListItemSkeleton() {
    return (
        <div className="flex items-center space-x-4 p-4 border border-border/50 rounded-2xl">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    )
}
