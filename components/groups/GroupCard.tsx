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
            className="flex flex-col h-full overflow-hidden group border-white/20 dark:border-white/10"
            hover={true}
        >
            {/* Main Overlay Link - Resolves Nested Link Hydration Error */}
            <Link
                href={`/groups/${membership.groupId}`}
                className="absolute inset-0 z-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-[inherit]"
                aria-label={`View ${group.name}`}
            />

            {/* Content Container - pointer-events-none so clicks fall through to the main link */}
            <div className="relative z-10 flex flex-col h-full pointer-events-none">
                {/* Top Branding & Header */}
                <div className="relative p-5 sm:p-6 flex-1">
                    {/* Simplified Glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 dark:bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12" />

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-500">
                                    <span className="font-black text-white text-base tracking-tighter">
                                        {group.name.substring(0, 1).toUpperCase()}
                                    </span>
                                </div>
                                {membership.status === 'ACTIVE' && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <h3 className="font-black text-lg text-foreground leading-tight group-hover:text-blue-600 dark:group-hover:text-banana transition-colors truncate pr-2">
                                    {group.name}
                                </h3>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        {membership.role}
                                    </p>
                                    <span className="text-border/60">|</span>
                                    <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {group._count?.members || 0} Members
                                    </p>
                                </div>
                            </div>
                        </div>

                        {membership.role === 'ADMIN' && (
                            /* Pointer Events Auto to enable clicking this nested button */
                            <div className="pointer-events-auto relative z-20">
                                <Link href={`/groups/${membership.groupId}/settings`}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-blue-600 hover:bg-blue-500/10 transition-all">
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Key Metric Highlight - Replaces Bento Grid */}
                    <div className="mt-6 flex items-end justify-between border-t border-dashed border-border/50 pt-4">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                {t('dashboard.monthly_contribution')}
                            </p>
                            <p className="text-lg font-black text-foreground">
                                {formatCurrency(group.monthlyContribution)}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide",
                                membership.status === 'ACTIVE'
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                            )}>
                                <Activity className="w-3 h-3" />
                                {membership.status}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-border/50 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ProgressRing
                                    radius={18}
                                    stroke={3}
                                    progress={65}
                                    trackClassName="stroke-slate-200 dark:stroke-slate-800"
                                    indicatorClassName="stroke-indigo-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[8px] font-black text-indigo-500">65%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                                    {t('groups.cycle_progress') || 'Cycle Progress'}
                                </p>
                                <p className="text-xs font-bold text-foreground">
                                    12 Days Left
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Streamlined Footer */}
                <div className="px-5 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between group-hover:bg-blue-500/5 transition-colors">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Tap to view details
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </GlassCard>
    )
}
