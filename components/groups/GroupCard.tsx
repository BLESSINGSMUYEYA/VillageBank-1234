'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import {
    Users,
    Wallet,
    Shield,
    ChevronRight,
    Settings,
    Star,
    TrendingUp,
    Calendar
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
            {/* Top Branding & Header */}
            <div className="relative p-5 sm:p-6 pb-2">
                {/* Ambient background glow for the card head */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 dark:bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-colors" />

                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <span className="font-black text-white text-lg tracking-tighter">
                                    {group.name.substring(0, 1).toUpperCase()}
                                </span>
                            </div>
                            {membership.status === 'ACTIVE' && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <h3 className="font-black text-lg text-foreground leading-tight group-hover:text-blue-600 dark:group-hover:text-banana transition-colors truncate pr-2">
                                {group.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={membership.status === 'ACTIVE' ? 'success' : 'warning'} className="rounded-lg px-2 py-0 text-[10px] uppercase font-black tracking-widest">
                                    {membership.status}
                                </Badge>
                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    {membership.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {membership.role === 'ADMIN' && (
                        <Link href={`/groups/${membership.groupId}/settings`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground/50 hover:text-blue-600 hover:bg-blue-500/10 transition-all">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Bento Grid */}
            <div className="px-5 sm:px-6 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/40 dark:bg-slate-950/40 rounded-2xl p-3 border border-white/50 dark:border-white/5 group-hover:border-blue-500/20 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2 opacity-60">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">{t('groups.members')}</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <p className="font-black text-xl text-foreground leading-none">
                                {group._count?.members || 0}
                            </p>
                            <span className="text-[9px] font-bold text-muted-foreground pb-0.5">active</span>
                        </div>
                    </div>
                    <div className="bg-white/40 dark:bg-slate-950/40 rounded-2xl p-3 border border-white/50 dark:border-white/5 group-hover:border-blue-500/20 transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2 opacity-60">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em]">Growth</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <p className="font-black text-xl text-foreground leading-none">
                                {group.maxLoanMultiplier}x
                            </p>
                            <span className="text-[9px] font-bold text-emerald-500 pb-0.5">cap</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Metadata Row */}
                <div className="bg-blue-600/5 dark:bg-white/5 rounded-2xl p-3 border border-blue-500/10 dark:border-white/5">
                    <div className="flex items-center justify-between mb-2 border-b border-blue-500/5 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Wallet className="w-3 h-3 text-blue-600 dark:text-banana" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('dashboard.monthly_contribution')}</span>
                        </div>
                        <p className="font-black text-xs text-foreground">
                            {formatCurrency(group.monthlyContribution)}
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Calendar className="w-3 h-3 text-blue-600 dark:text-banana" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t('groups.cycle_duration')}</span>
                        </div>
                        <p className="font-black text-xs text-foreground">
                            {t('groups.next_30_days')}
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA / Action Area */}
            <div className="p-5 sm:p-6 pt-4">
                <Link href={`/groups/${membership.groupId}`} className="block">
                    <Button
                        variant="default"
                        className="w-full h-11 rounded-xl font-black text-sm shadow-xl shadow-yellow-500/10 group-hover:scale-[1.02] active:scale-[0.98] transition-all group/btn"
                    >
                        {t('groups.view_dashboard')}
                        <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>
        </GlassCard>
    )
}
