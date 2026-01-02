import { Skeleton } from "@/components/ui/skeleton"
export { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

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
