
import { GlassCard } from '@/components/ui/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'

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

export function ChartsSkeleton() {
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

export function ActivitySkeleton() {
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
                <ChartsSkeleton />
                <ActivitySkeleton />
            </div>
        </div>
    )
}
