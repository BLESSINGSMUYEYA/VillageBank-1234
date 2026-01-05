
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/layout/PageHeader'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Shield, Activity, User, Clock, Search } from 'lucide-react'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// Force dynamic to ensure real-time logs
export const dynamic = 'force-dynamic'

async function getActivities() {
    return await prisma.activity.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                }
            }
        }
    })
}

export default async function AuditLogPage() {
    // Security Check
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const payload = token ? await verifyToken(token) : null

    // @ts-ignore
    if (!payload || (payload.role !== 'SUPER_ADMIN' && payload.role !== 'REGIONAL_ADMIN')) {
        redirect('/dashboard')
    }

    const activities = await getActivities()

    return (
        <div className="space-y-8 container mx-auto pb-20">
            <PageHeader
                title="System Audit Log"
                description="Secure track of all system activities and critical actions."
            />

            <GlassCard className="p-0 overflow-hidden border-white/10">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <Activity className="w-4 h-4" />
                        <span>Recent Activities</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                        {activities.length} Events
                    </Badge>
                </div>

                <div className="divide-y divide-white/5">
                    {activities.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No activities recorded yet.
                        </div>
                    ) : (
                        activities.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-white/5 transition-colors group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="mt-1 p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground">
                                                    {log.actionType}
                                                </span>
                                                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                                                    • {log.user.email}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {log.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </div>
                                        <Badge variant="secondary" className="mt-2 text-[10px] uppercase tracking-wider scale-90 origin-right opacity-50 group-hover:opacity-100 transition-opacity">
                                            {log.user.role}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    )
}
