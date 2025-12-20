import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-1" />
                            <Skeleton className="h-3 w-[120px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity Skeleton */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-[150px]" />
                            <Skeleton className="h-4 w-[250px]" />
                        </div>
                        <Skeleton className="h-9 w-[100px]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Skeleton className="w-2 h-2 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-[200px]" />
                                        <Skeleton className="h-3 w-[100px]" />
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <Skeleton className="h-4 w-[80px]" />
                                    <Skeleton className="h-3 w-[60px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Charts Section Skeleton */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-9 w-[120px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="p-6">
                            <Skeleton className="h-8 w-[80px] mb-2" />
                            <Skeleton className="h-3 w-[120px]" />
                        </Card>
                    ))}
                </div>

                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        </div>
    )
}
