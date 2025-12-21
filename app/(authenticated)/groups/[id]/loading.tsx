import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function GroupDetailLoading() {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-9 w-[150px]" /> {/* Back button */}
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[250px]" /> {/* Group Name */}
                        <Skeleton className="h-4 w-[350px]" /> {/* Description */}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Skeleton className="h-6 w-[80px]" /> {/* Region Badge */}
                    <Skeleton className="h-9 w-[120px]" /> {/* Settings button */}
                </div>
            </div>

            {/* Group Stats Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[80px] mb-1" />
                            <Skeleton className="h-3 w-[120px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="space-y-4">
                <div className="grid w-full grid-cols-4 gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>

                {/* Tab Content Placeholder */}
                <Card className="h-[400px]">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
