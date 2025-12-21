import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ContributionChart,
    GroupComparisonChart,
    TrendChart,
    PaymentMethodsChart,
    SummaryStats
} from '@/components/charts/ContributionChart'
import { getChartData } from '@/lib/dashboard-service'

export default async function DashboardCharts() {
    const chartData = await getChartData()

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Summary Stats */}
            <SummaryStats
                totalContributions={chartData.summaryStats.totalContributions}
                averageMonthly={chartData.summaryStats.averageMonthly}
                highestMonth={chartData.summaryStats.highestMonth}
                currentStreak={chartData.summaryStats.currentStreak}
            />

            {/* Charts Grid */}
            <Tabs defaultValue="contributions" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                    <TabsTrigger value="contributions" className="text-xs sm:text-sm">Contributions</TabsTrigger>
                    <TabsTrigger value="groups" className="text-xs sm:text-sm">Groups</TabsTrigger>
                    <TabsTrigger value="trends" className="text-xs sm:text-sm">Trends</TabsTrigger>
                    <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="contributions" className="space-y-4">
                    <ContributionChart
                        data={chartData.monthlyData}
                        title="Monthly Contribution History"
                        description="Your contribution patterns over the last 12 months"
                    />
                </TabsContent>

                <TabsContent value="groups" className="space-y-4">
                    <GroupComparisonChart
                        data={chartData.groupComparison}
                        title="Group Performance Comparison"
                        description="Compare contributions and loans across your groups"
                    />
                </TabsContent>

                <TabsContent value="trends" className="space-y-4">
                    <TrendChart
                        data={chartData.monthlyData}
                        title="Contribution Trends"
                        description="Visualize your contribution patterns over time"
                    />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <PaymentMethodsChart
                        data={chartData.paymentMethods}
                        title="Payment Methods Distribution"
                        description="Breakdown of payment methods you've used"
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
