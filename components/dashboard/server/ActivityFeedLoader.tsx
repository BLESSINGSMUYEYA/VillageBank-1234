
import { getRecentActivity } from '@/lib/dashboard-service'
import { ActivityFeed } from '../ActivityFeed'

export async function ActivityFeedLoader() {
    const recentActivity = await getRecentActivity()

    return <ActivityFeed recentActivity={recentActivity} />
}
