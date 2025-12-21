import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChartsSkeleton() {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Summary Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-6">
                        <Skeleton className="h-8 w-[80px] mb-2" />
                        <Skeleton className="h-3 w-[120px]" />
                    </Card>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="space-y-4">
                <div className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        </div>
    )
}
