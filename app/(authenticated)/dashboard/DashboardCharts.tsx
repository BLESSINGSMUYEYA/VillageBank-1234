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
                <div className="sticky top-0 z-20 pt-2 pointer-events-none">
                    <TabsList className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/40 dark:border-white/10 w-full justify-start h-14 sm:h-16 shadow-xl pointer-events-auto overflow-x-auto no-scrollbar">
                        <TabsTrigger value="contributions" className="rounded-xl px-4 sm:px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2 whitespace-nowrap">Contributions</TabsTrigger>
                        <TabsTrigger value="groups" className="rounded-xl px-4 sm:px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2 whitespace-nowrap">Groups</TabsTrigger>
                        <TabsTrigger value="trends" className="rounded-xl px-4 sm:px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2 whitespace-nowrap">Trends</TabsTrigger>
                        <TabsTrigger value="payments" className="rounded-xl px-4 sm:px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-banana dark:data-[state=active]:text-blue-950 transition-all flex items-center gap-2 whitespace-nowrap">Payments</TabsTrigger>
                    </TabsList>
                </div>

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
