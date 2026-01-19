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

interface GroupListItemProps {
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

export function GroupListItem({ membership }: GroupListItemProps) {
    const { t } = useLanguage()
    const { group } = membership

    return (
        <GlassCard
            className="group border-white/20 dark:border-white/10 p-4 transition-all hover:bg-white/60 dark:hover:bg-slate-900/60"
            hover={true}
            gradient={false}
            blur="xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            {/* Main Overlay Link */}
            <Link
                href={`/groups/${membership.groupId}`}
                className="absolute inset-0 z-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-[inherit]"
                aria-label={`View ${group.name}`}
            />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-none">
                {/* Identity & Basic Info */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/10 group-hover:scale-105 transition-transform duration-300">
                        <span className="font-black text-blue-600 dark:text-banana text-base sm:text-lg">
                            {group.name.substring(0, 1).toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-black text-base sm:text-lg text-foreground leading-none group-hover:text-blue-600 dark:group-hover:text-banana transition-colors truncate mb-1.5">
                            {group.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
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

                {/* Metrics */}
                <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
                    <div className="hidden sm:block">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 mb-0.5">
                            {t('dashboard.monthly_contribution')}
                        </p>
                        <p className="text-sm sm:text-base font-black text-foreground">
                            {formatCurrency(group.monthlyContribution)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full",
                            membership.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600" : "bg-yellow-500/10 text-yellow-600"
                        )}>
                            <Activity className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                            {membership.status}
                        </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10">
                        <div className="relative shrink-0 w-8 h-8">
                            <ProgressRing
                                radius={14}
                                stroke={2.5}
                                progress={65}
                                trackClassName="stroke-slate-200 dark:stroke-slate-800"
                                indicatorClassName="stroke-blue-500 dark:stroke-banana"
                            />
                        </div>
                    </div>

                    {membership.role === 'ADMIN' && (
                        <div className="pointer-events-auto">
                            <Link href={`/groups/${membership.groupId}/settings`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-blue-600 hover:bg-blue-500/10 transition-all">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </GlassCard>
    )
}
