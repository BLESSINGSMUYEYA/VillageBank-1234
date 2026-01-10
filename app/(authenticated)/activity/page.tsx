import { getAllActivities } from '@/lib/dashboard-service'
import { ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
    title: 'Your Activity | Village Bank',
    description: 'View your recent activity history across all groups.',
}

export default async function ActivityPage() {
    const activities = await getAllActivities()

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col gap-6">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-tab-label text-muted-foreground hover:text-foreground transition-colors group w-fit"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-page-title text-foreground mb-2">
                            Activity History
                        </h1>
                        <p className="text-body-primary text-muted-foreground max-w-lg">
                            A complete log of your contributions, loans, and group interactions.
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-micro font-bold text-muted-foreground">Live Updates</span>
                    </div>
                </div>
            </div>

            <div className="rounded-[32px] border border-white/20 dark:border-white/10 shadow-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-md overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <h3 className="text-section-title uppercase text-muted-foreground">
                            All Transactions
                        </h3>
                        <span className="ml-auto text-micro font-bold text-muted-foreground opacity-50">
                            Showing last 50 items
                        </span>
                    </div>
                </div>

                {/* Reuse ActivityFeed's internal list logic but in a full page context */}
                {/* Since ActivityFeed is a component, we can wrap the data in a way it accepts, 
                    or we can create a dedicated list here if we want more detail.
                    However, reusing ActivityFeed is cleaner if it looks good. 
                    Let's check ActivityFeed props. It takes `recentActivity`.
                    But ActivityFeed includes a header and "View All" link we don't want here.
                    Actually, ActivityFeed has its own header. 
                    Let's duplicate the list logic here for full control and better "page" layout,
                    OR refactor ActivityFeed to be more reusable.
                    Given the task constraints, I will create a dedicated list here using the same components
                    to avoid modifying ActivityFeed which is dashboard-specific. 
                    I will simply map over `activities`.
                */}
                <ActivityList activities={activities} />
            </div>
        </div>
    )
}

function ActivityList({ activities }: { activities: any[] }) {
    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-section-title text-foreground mb-2">No activity yet</h3>
                <p className="text-body-primary text-muted-foreground max-w-xs mx-auto">
                    Your financial journey begins with your first contribution or loan request.
                </p>
            </div>
        )
    }

    return (
        <div className="divide-y divide-border/50">
            {activities.map((activity) => (
                <div
                    key={activity.id}
                    className="p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group flex items-start sm:items-center gap-4 sm:gap-6"
                >
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                        activity.type.includes('LOAN') ? 'bg-blue-600/10 text-blue-500' :
                            activity.type.includes('CONTRIBUTION') ? 'bg-emerald-600/10 text-emerald-500' :
                                'bg-slate-600/10 text-slate-500'
                    )}>
                        <span className="font-black text-lg">{(activity.groupTag || activity.groupName || 'V').charAt(0).toUpperCase()}</span>
                    </div>

                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div>
                            <p className="text-body-primary font-bold text-foreground mb-1">{activity.description}</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-tab-label h-5 bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                                    {activity.groupTag ? `@${activity.groupTag}` : activity.groupName}
                                </Badge>
                                <span className="text-micro font-medium text-muted-foreground opacity-60 hidden sm:inline-block">•</span>
                                <span className="text-micro font-medium text-muted-foreground opacity-60">
                                    {new Date(activity.createdAt).toLocaleDateString(undefined, {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="text-left sm:text-right flex flex-col justify-center">
                            {activity.amount && (
                                <p className="text-stat-value text-xl font-black text-foreground mb-0.5">
                                    {formatCurrency(activity.amount)}
                                </p>
                            )}
                            <p className="text-micro font-black uppercase tracking-widest text-muted-foreground/40">
                                {activity.type.replace(/_/g, ' ')}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
