'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import {
    Users,
    Shield,
    ChevronRight,
    Settings,
    Activity
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GroupCardProps {
    membership: {
        id: string
        role: string
        status: string
        groupId: string
        group: {
            name: string
            monthlyContribution: number
            maxLoanMultiplier: number
            _count: {
                members: number
            }
        }
    }
}

export function GroupCard({ membership }: GroupCardProps) {
    const { t } = useLanguage()
    const { group } = membership

    return (
        <GlassCard
            className="flex flex-col h-full overflow-hidden group border-white/20 dark:border-white/10 p-0 min-h-[300px]"
            hover={true}
            gradient={false}
            blur="xl"
        >
            {/* Main Overlay Link */}
            <Link
                href={`/groups/${membership.groupId}`}
                className="absolute inset-0 z-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-[inherit]"
                aria-label={`View ${group.name}`}
            />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full pointer-events-none p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/10 group-hover:scale-105 transition-transform duration-300">
                            <span className="font-black text-blue-600 dark:text-banana text-lg">
                                {group.name.substring(0, 1).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-black text-lg sm:text-xl text-foreground leading-none group-hover:text-blue-600 dark:group-hover:text-banana transition-colors truncate mb-2">
                                {group.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5 text-[9px] uppercase tracking-widest px-2 h-5">
                                    {membership.role}
                                </Badge>
                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {group._count?.members || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {membership.role === 'ADMIN' && (
                        <div className="pointer-events-auto relative z-20">
                            <Link href={`/groups/${membership.groupId}/settings`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-blue-600 hover:bg-blue-500/10 transition-all">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Metrics */}
                <div className="flex-1 space-y-5">
                    <div className="flex items-end justify-between p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
                                {t('dashboard.monthly_contribution')}
                            </p>
                            <p className="text-2xl sm:text-3xl font-black text-foreground">
                                {formatCurrency(group.monthlyContribution)}
                            </p>
                        </div>
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full",
                            membership.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-yellow-500/10 text-yellow-600"
                        )}>
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/20 dark:bg-white/5">
                        <div className="relative shrink-0">
                            <ProgressRing
                                radius={18}
                                stroke={3}
                                progress={65}
                                trackClassName="stroke-slate-200 dark:stroke-slate-800"
                                indicatorClassName="stroke-blue-500 dark:stroke-banana"
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
                                {t('groups.cycle_status')}
                            </p>
                            <p className="text-sm font-black text-foreground">
                                65% {t('groups.cycle_complete')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>
    )
}
