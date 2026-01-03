import { PageHeader } from "@/components/layout/PageHeader"
import { StatsCardSkeleton, VaultCreditSkeleton, Skeleton } from "@/components/ui/Skeletons"

export default function VaultLoading() {
    return (
        <div className="space-y-8 sm:space-y-12 pb-20 animate-pulse-slow">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <Skeleton className="h-4 w-64 rounded-lg" />
            </div>

            {/* Quick Stats Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
            </div>

            {/* Tabs & Content Skeleton */}
            <div className="space-y-8">
                <div className="flex gap-2">
                    <Skeleton className="h-12 w-32 rounded-full" />
                    <Skeleton className="h-12 w-32 rounded-full" />
                </div>

                {/* Table Skeleton fallback */}
                <div className="zen-card overflow-hidden">
                    <div className="bg-muted/10 h-16 w-full border-b border-white/5" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 w-full border-b border-white/5 p-8 flex items-center justify-between">
                            <Skeleton className="h-4 w-32" />
                            <div className="flex flex-col items-end gap-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-2 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
