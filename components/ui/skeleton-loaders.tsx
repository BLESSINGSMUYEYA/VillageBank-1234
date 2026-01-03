'use client'

import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-shimmer rounded-md bg-muted/40", className)}
            {...props}
        />
    )
}

export function StatsCardSkeleton() {
    return (
        <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-32" />
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-12 rounded-lg" />
            </div>
        </div>
    )
}

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

export { Skeleton }
