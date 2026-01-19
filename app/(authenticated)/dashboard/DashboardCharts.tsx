import { getChartData } from '@/lib/dashboard-service'
import { DashboardChartsClient } from './DashboardChartsClient'

export default async function DashboardCharts() {
    const chartData = await getChartData()

    return <DashboardChartsClient chartData={chartData} />
}
